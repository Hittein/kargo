package com.kargo.api.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Journal d'activité d'un utilisateur. Inséré automatiquement par les
 * controllers/services sur les événements clés (login, publish annonce,
 * vue d'annonce, contact, booking).
 *
 * Cette table peut grossir vite — à purger/archiver au-delà de N jours
 * en V2 via un @Scheduled.
 */
@Entity
@Table(name = "user_activities", indexes = {
        @Index(name = "idx_ua_user", columnList = "user_id,createdAt"),
        @Index(name = "idx_ua_type", columnList = "type")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserActivity {
    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** LOGIN | SIGNUP | PUBLISH_LISTING | VIEW_LISTING | CONTACT_LISTING | BOOK_TRIP | SEND_MESSAGE | etc. */
    @Column(nullable = false, length = 32)
    private String type;

    /** Description courte lisible (ex: "A publié Toyota Corolla 2020"). */
    @Column(length = 500)
    private String summary;

    /** Payload JSON libre (ex: listingId, amount, partyName). */
    @Column(length = 2000)
    private String metadataJson;

    @Column(nullable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
    }
}
