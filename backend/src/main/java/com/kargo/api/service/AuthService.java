package com.kargo.api.service;

import com.kargo.api.model.OtpChallenge;
import com.kargo.api.model.User;
import com.kargo.api.model.Wallet;
import com.kargo.api.repository.OtpChallengeRepository;
import com.kargo.api.repository.UserRepository;
import com.kargo.api.repository.WalletRepository;
import com.kargo.api.security.JwtService;
import com.kargo.api.util.PhoneUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

@Service
public class AuthService {

    private final OtpChallengeRepository otpRepo;
    private final UserRepository userRepo;
    private final WalletRepository walletRepo;
    private final JwtService jwt;
    private final boolean simulate;

    public AuthService(
            OtpChallengeRepository otpRepo,
            UserRepository userRepo,
            WalletRepository walletRepo,
            JwtService jwt,
            @Value("${kargo.otp.simulate}") boolean simulate
    ) {
        this.otpRepo = otpRepo;
        this.userRepo = userRepo;
        this.walletRepo = walletRepo;
        this.jwt = jwt;
        this.simulate = simulate;
    }

    public StartResult start(String phone) {
        String normalized = PhoneUtil.normalize(phone);
        if (normalized == null) return new StartResult(null, null);
        String code = String.format("%06d", (int) (Math.random() * 1_000_000));
        OtpChallenge challenge = OtpChallenge.builder()
                .phone(normalized)
                .code(code)
                .expiresAt(Instant.now().plus(5, ChronoUnit.MINUTES))
                .build();
        otpRepo.save(challenge);
        // En mode simulé on renvoie le code dans la réponse pour pouvoir tester sans SMS gateway.
        return new StartResult(challenge.getId().toString(), simulate ? code : null);
    }

    public VerifyResult verify(String phone, String code) {
        String normalized = PhoneUtil.normalize(phone);
        if (normalized == null) return VerifyResult.invalid();
        Optional<OtpChallenge> latest = otpRepo.findFirstByPhoneAndConsumedFalseOrderByCreatedAtDesc(normalized);
        if (latest.isEmpty()) return VerifyResult.invalid();
        OtpChallenge challenge = latest.get();
        if (Instant.now().isAfter(challenge.getExpiresAt())) return VerifyResult.expired();
        if (challenge.getAttempts() >= 5) return VerifyResult.tooMany();

        boolean accept = challenge.getCode().equals(code) || (simulate && ("0000".equals(code) || "000000".equals(code)));
        if (!accept) {
            challenge.setAttempts(challenge.getAttempts() + 1);
            otpRepo.save(challenge);
            return VerifyResult.invalid();
        }
        challenge.setConsumed(true);
        otpRepo.save(challenge);

        User user = userRepo.findByPhone(normalized).orElseGet(() -> {
            User created = userRepo.save(User.builder()
                    .phone(normalized)
                    .name("")
                    .phoneVerified(true)
                    .build());
            walletRepo.save(Wallet.builder().user(created).build());
            return created;
        });
        user.setPhoneVerified(true);
        userRepo.save(user);

        String token = jwt.issueAccessToken(user.getId(), user.getPhone());
        return VerifyResult.ok(token, user);
    }

    public record StartResult(String challengeId, String simulatedCode) {}

    public static final class VerifyResult {
        public final boolean ok;
        public final String reason;
        public final String token;
        public final User user;
        private VerifyResult(boolean ok, String reason, String token, User user) {
            this.ok = ok; this.reason = reason; this.token = token; this.user = user;
        }
        public static VerifyResult ok(String token, User user) { return new VerifyResult(true, null, token, user); }
        public static VerifyResult invalid() { return new VerifyResult(false, "invalid", null, null); }
        public static VerifyResult expired() { return new VerifyResult(false, "expired", null, null); }
        public static VerifyResult tooMany() { return new VerifyResult(false, "too_many", null, null); }
    }
}
