package com.kargo.api.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Map;
import java.util.TreeMap;
import java.util.zip.CRC32;

/**
 * Génère des tokens Agora RTC AccessToken2 (version "007") pour joindre un canal.
 * Implémentation standalone basée sur la spec publique d'Agora :
 * https://docs.agora.io/en/video-calling/develop/authentication-workflow
 *
 * Dépend de deux env vars (profile prod) :
 *  - AGORA_APP_ID : identifiant public du projet Agora
 *  - AGORA_APP_CERTIFICATE : clé symétrique privée (sert à signer)
 *
 * En dev, les valeurs par défaut sont absentes → {@link #isConfigured()} renvoie false
 * et le controller doit refuser poliment la demande.
 */
@Service
public class AgoraTokenService {

    private static final short SERVICE_RTC = 1;
    private static final short PRIVILEGE_JOIN_CHANNEL = 1;
    private static final short PRIVILEGE_PUBLISH_AUDIO_STREAM = 2;
    private static final short PRIVILEGE_PUBLISH_VIDEO_STREAM = 3;
    private static final short PRIVILEGE_PUBLISH_DATA_STREAM = 4;

    public enum Role {
        PUBLISHER, // peut publier (caller + callee typique)
        SUBSCRIBER // listeners only
    }

    private final String appId;
    private final String appCertificate;
    private final SecureRandom random = new SecureRandom();

    public AgoraTokenService(
            @Value("${kargo.agora.app-id:}") String appId,
            @Value("${kargo.agora.app-certificate:}") String appCertificate
    ) {
        this.appId = appId == null ? "" : appId;
        this.appCertificate = appCertificate == null ? "" : appCertificate;
    }

    public boolean isConfigured() {
        return !appId.isBlank() && !appCertificate.isBlank();
    }

    public String appId() {
        return appId;
    }

    /**
     * @param channelName nom du canal (doit matcher celui utilisé côté client)
     * @param uid 0 = anonyme assigné par Agora ; sinon un entier stable par utilisateur
     * @param role publisher pour pouvoir parler/filmer, subscriber pour listener
     * @param ttlSeconds durée de validité (typiquement 3600)
     */
    public String buildRtcToken(String channelName, long uid, Role role, int ttlSeconds) {
        if (!isConfigured()) {
            throw new IllegalStateException("agora_not_configured");
        }
        int issueTs = (int) (System.currentTimeMillis() / 1000);
        int expireTs = issueTs + ttlSeconds;

        // --- Service RTC : privileges ---
        TreeMap<Short, Integer> privileges = new TreeMap<>();
        privileges.put(PRIVILEGE_JOIN_CHANNEL, expireTs);
        if (role == Role.PUBLISHER) {
            privileges.put(PRIVILEGE_PUBLISH_AUDIO_STREAM, expireTs);
            privileges.put(PRIVILEGE_PUBLISH_VIDEO_STREAM, expireTs);
            privileges.put(PRIVILEGE_PUBLISH_DATA_STREAM, expireTs);
        }

        byte[] servicePayload = packRtcService(channelName, uid, privileges);

        // --- AccessToken2 body ---
        // [salt(4)][issueTs(4)][expireTs(4)][services_count(2)][service_type(2)][service_payload(...)]
        int salt = random.nextInt();
        ByteArrayOutputStream body = new ByteArrayOutputStream();
        try {
            body.write(le4(salt));
            body.write(le4(issueTs));
            body.write(le4(expireTs));
            body.write(le2((short) 1)); // nb services
            body.write(le2(SERVICE_RTC));
            body.write(servicePayload);
        } catch (IOException e) {
            throw new RuntimeException(e); // ByteArrayOutputStream ne lève pas vraiment
        }

        byte[] bodyBytes = body.toByteArray();

        // --- Signature ---
        byte[] signKey = hmacSha256(appCertificate.getBytes(), le4(issueTs));
        byte[] signature = hmacSha256(signKey, bodyBytes);

        // --- AccessToken2 envelope : version(3) + appId(32) + crc_bytes + content ---
        ByteArrayOutputStream content = new ByteArrayOutputStream();
        try {
            content.write(lenBytes(signature));
            content.write(lenBytes(appId.getBytes()));
            content.write(bodyBytes);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        byte[] contentBytes = content.toByteArray();

        String base64 = Base64.getEncoder().withoutPadding().encodeToString(contentBytes);
        return "007" + base64;
    }

    /** Encode le payload du service RTC (type=1). */
    private static byte[] packRtcService(String channelName, long uid, Map<Short, Integer> privileges) {
        // [type(2)][channelNameLen(2)][channelName][uidLen(2)][uidStr][privilegesCount(2)]
        // [priv_key(2)][priv_value(4)] *
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            out.write(le2(SERVICE_RTC));
            byte[] cn = channelName.getBytes();
            out.write(le2((short) cn.length));
            out.write(cn);
            String uidStr = uid == 0 ? "" : Long.toString(uid & 0xFFFFFFFFL);
            byte[] ub = uidStr.getBytes();
            out.write(le2((short) ub.length));
            out.write(ub);
            out.write(le2((short) privileges.size()));
            for (Map.Entry<Short, Integer> e : privileges.entrySet()) {
                out.write(le2(e.getKey()));
                out.write(le4(e.getValue()));
            }
        } catch (IOException ex) {
            throw new RuntimeException(ex);
        }
        return out.toByteArray();
    }

    private static byte[] lenBytes(byte[] data) {
        byte[] out = new byte[2 + data.length];
        out[0] = (byte) (data.length & 0xFF);
        out[1] = (byte) ((data.length >> 8) & 0xFF);
        System.arraycopy(data, 0, out, 2, data.length);
        return out;
    }

    private static byte[] le2(short v) {
        ByteBuffer b = ByteBuffer.allocate(2).order(ByteOrder.LITTLE_ENDIAN);
        b.putShort(v);
        return b.array();
    }

    private static byte[] le4(int v) {
        ByteBuffer b = ByteBuffer.allocate(4).order(ByteOrder.LITTLE_ENDIAN);
        b.putInt(v);
        return b.array();
    }

    private static byte[] hmacSha256(byte[] key, byte[] data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(key, "HmacSHA256"));
            return mac.doFinal(data);
        } catch (Exception e) {
            throw new RuntimeException("hmac_failure", e);
        }
    }

    /** Utilisé pour hasher un channel name en uid stable si l'app n'en fournit pas. */
    public static long stableUidFromKey(String key) {
        CRC32 c = new CRC32();
        c.update(key.getBytes());
        return c.getValue();
    }
}
