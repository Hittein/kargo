package com.kargo.api.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kargo.api.model.User;
import com.kargo.api.model.UserActivity;
import com.kargo.api.repository.UserActivityRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Helper injecté dans controllers/services pour logger les événements
 * utilisateur sans dupliquer la plomberie. Fail-safe : une exception de log
 * ne doit jamais interrompre la requête métier.
 */
@Service
public class ActivityLogger {

    private static final Logger log = LoggerFactory.getLogger(ActivityLogger.class);
    private final UserActivityRepository repo;
    private final ObjectMapper mapper = new ObjectMapper();

    public ActivityLogger(UserActivityRepository repo) {
        this.repo = repo;
    }

    public void record(User user, String type, String summary, Map<String, Object> metadata) {
        if (user == null || type == null) return;
        try {
            String json = metadata == null || metadata.isEmpty()
                    ? null
                    : mapper.writeValueAsString(metadata);
            UserActivity a = UserActivity.builder()
                    .user(user)
                    .type(type.toUpperCase())
                    .summary(summary)
                    .metadataJson(json)
                    .build();
            repo.save(a);
        } catch (Exception e) {
            log.warn("ActivityLogger.record failed for user={} type={}: {}",
                    user.getId(), type, e.getMessage());
        }
    }

    public void record(User user, String type, String summary) {
        record(user, type, summary, null);
    }
}
