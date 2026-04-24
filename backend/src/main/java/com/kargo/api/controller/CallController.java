package com.kargo.api.controller;

import com.kargo.api.model.Conversation;
import com.kargo.api.model.User;
import com.kargo.api.repository.ConversationRepository;
import com.kargo.api.service.AgoraTokenService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Endpoints de téléphonie in-app basés sur Agora.
 *
 * Principe : le nom du canal RTC = l'id de la conversation. Seuls les 2 participants
 * de la conversation peuvent obtenir un token valide (auth + ownership check).
 * L'uid RTC = hash stable de l'id utilisateur (permet au peer d'identifier qui parle).
 */
@RestController
@RequestMapping("/api/v1/calls")
public class CallController {

    private final AgoraTokenService tokens;
    private final ConversationRepository conversations;
    private final int ttlSeconds;

    public CallController(
            AgoraTokenService tokens,
            ConversationRepository conversations,
            @Value("${kargo.agora.token-ttl-seconds:3600}") int ttlSeconds
    ) {
        this.tokens = tokens;
        this.conversations = conversations;
        this.ttlSeconds = ttlSeconds;
    }

    /** Signe un token RTC pour rejoindre un canal = id de la conversation. */
    @PostMapping("/token")
    public ResponseEntity<?> issueToken(
            @AuthenticationPrincipal User principal,
            @RequestBody TokenRequest body
    ) {
        if (principal == null) return ResponseEntity.status(401).build();
        if (!tokens.isConfigured()) {
            return ResponseEntity.status(503).body(
                    new TokenError("agora_not_configured",
                            "Les appels sont temporairement indisponibles côté serveur.")
            );
        }
        if (body == null || body.conversationId() == null || body.conversationId().isBlank()) {
            return ResponseEntity.badRequest().body(
                    new TokenError("conversationId_required", "Champ conversationId requis.")
            );
        }
        UUID convUuid;
        try {
            convUuid = UUID.fromString(body.conversationId());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    new TokenError("conversationId_invalid", "Identifiant de conversation invalide.")
            );
        }
        Conversation conv = conversations.findById(convUuid).orElse(null);
        if (conv == null) return ResponseEntity.status(404).build();
        if (!isParticipant(conv, principal)) return ResponseEntity.status(403).build();

        String channelName = conv.getId().toString();
        long uid = AgoraTokenService.stableUidFromKey(principal.getId().toString());
        String token = tokens.buildRtcToken(
                channelName, uid, AgoraTokenService.Role.PUBLISHER, ttlSeconds
        );
        return ResponseEntity.ok(new TokenResponse(
                tokens.appId(),
                channelName,
                uid,
                token,
                ttlSeconds,
                "video".equalsIgnoreCase(body.mode()) ? "video" : "audio"
        ));
    }

    private static boolean isParticipant(Conversation c, User user) {
        if (c.getParticipantA() != null && c.getParticipantA().getId().equals(user.getId())) return true;
        if (c.getParticipantB() != null && c.getParticipantB().getId().equals(user.getId())) return true;
        return false;
    }

    /** mode = "audio" (defaut) ou "video" — sert uniquement au tracking, le token est identique. */
    public record TokenRequest(String conversationId, String mode) {}

    public record TokenResponse(
            String appId, String channelName, long uid,
            String token, int ttlSeconds, String mode
    ) {}

    public record TokenError(String code, String message) {}
}
