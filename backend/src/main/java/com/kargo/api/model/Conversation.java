package com.kargo.api.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

/**
 * Conversation 1-à-1 entre 2 utilisateurs, optionnellement rattachée à un
 * listing. Support threads utilisent participantA = user, participantB = null
 * et kind = "support".
 */
@Entity
@Table(name = "conversations", indexes = {
        @Index(name = "idx_conv_a", columnList = "participant_a_id"),
        @Index(name = "idx_conv_b", columnList = "participant_b_id"),
        @Index(name = "idx_conv_listing", columnList = "listingId"),
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Conversation {
    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "participant_a_id", nullable = false)
    private User participantA;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant_b_id")
    private User participantB;

    /** LISTING | RENTAL | TRIP | SUPPORT */
    @Column(nullable = false, length = 16)
    private String kind;

    /** Id de l'objet rattaché (listing, rental, trip). Null pour support. */
    private UUID listingId;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant lastMessageAt;

    private String lastMessagePreview;

    @Column(nullable = false)
    @Builder.Default
    private int unreadForA = 0;

    @Column(nullable = false)
    @Builder.Default
    private int unreadForB = 0;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        if (lastMessageAt == null) lastMessageAt = now;
    }
}
