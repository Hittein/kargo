package com.kargo.api.config;

import com.kargo.api.model.User;
import com.kargo.api.repository.UserRepository;
import com.kargo.api.util.PhoneUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.dao.DataIntegrityViolationException;

/**
 * Normalise le phone des users existants en base au démarrage (migration idempotente).
 * Les conflits d'unicité (= doublons détectés) sont loggés et laissés tels quels —
 * la fusion se fait via l'endpoint admin dédié pour garder le contrôle humain.
 */
@Configuration
public class PhoneNormalizationMigrator {

    private static final Logger log = LoggerFactory.getLogger(PhoneNormalizationMigrator.class);

    @Bean
    CommandLineRunner normalizePhones(UserRepository users) {
        return args -> {
            int migrated = 0;
            int conflicts = 0;
            int invalid = 0;
            for (User u : users.findAll()) {
                String raw = u.getPhone();
                String norm = PhoneUtil.normalize(raw);
                if (norm == null) {
                    invalid++;
                    continue;
                }
                if (norm.equals(raw)) continue;
                u.setPhone(norm);
                try {
                    users.save(u);
                    migrated++;
                } catch (DataIntegrityViolationException e) {
                    // Un autre user existe déjà avec ce phone normalisé → on rollback le
                    // phone de celui-ci. L'admin merge manuellement via /admin/users/duplicates.
                    u.setPhone(raw);
                    conflicts++;
                    log.warn("Phone normalization conflict for user {}: {} -> {} already taken",
                            u.getId(), raw, norm);
                }
            }
            if (migrated + conflicts + invalid > 0) {
                log.info("Phone normalization: {} migrated, {} conflicts, {} invalid",
                        migrated, conflicts, invalid);
            }
        };
    }
}
