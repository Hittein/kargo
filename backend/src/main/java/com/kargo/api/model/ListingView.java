package com.kargo.api.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Chaque ouverture de la fiche d'une annonce = 1 ligne.
 * viewer peut être null si le visiteur n'est pas authentifié.
 */
@Entity
@Table(name = "listing_views", indexes = {
        @Index(name = "idx_lv_listing", columnList = "listing_id,viewedAt"),
        @Index(name = "idx_lv_viewer", columnList = "viewer_id,viewedAt")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ListingView {
    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "listing_id", nullable = false)
    private Listing listing;

    /** Null pour un visiteur non-authentifié. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "viewer_id")
    private User viewer;

    @Column(nullable = false)
    private Instant viewedAt;

    @PrePersist
    void onCreate() {
        if (viewedAt == null) viewedAt = Instant.now();
    }
}
