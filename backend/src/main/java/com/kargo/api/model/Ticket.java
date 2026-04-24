package com.kargo.api.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Billet acheté par un utilisateur pour un trajet (Trip).
 *
 * Le flow côté mobile gère déjà la plomberie wallet/points/passagers en local ;
 * cet enregistrement ne fait que tracer *qu'il y a eu achat* côté serveur pour
 * que l'admin puisse voir les billets par user, et que les vendeurs/admins
 * puissent suivre la fréquentation d'un trajet.
 */
@Entity
@Table(name = "tickets", indexes = {
        @Index(name = "idx_tkt_user", columnList = "user_id,createdAt"),
        @Index(name = "idx_tkt_trip", columnList = "trip_id,createdAt")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {
    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Column(nullable = false)
    private int seatsBooked;

    @Column(nullable = false)
    private long totalPaidMru;

    /** kargo_wallet | bankily | masrvi | sedad | card */
    @Column(nullable = false, length = 32)
    private String paymentMethod;

    /** reserved | paid | used | cancelled | refunded */
    @Column(nullable = false, length = 16)
    @Builder.Default
    private String status = "paid";

    @Column(length = 64)
    private String qrToken;

    @Column(nullable = false)
    private Instant createdAt;

    private Instant usedAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
    }
}
