package com.kargo.api.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "saved_searches", indexes = {
        @Index(name = "idx_saved_user", columnList = "user_id"),
        @Index(name = "idx_saved_notify", columnList = "notifyEnabled")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavedSearch {
    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String name;

    /** Snapshot JSON des filtres (VehicleFilters côté mobile). */
    @Column(nullable = false, length = 4000)
    private String filtersJson;

    private String sort;

    private String query;

    /** Raccourci catégorie (duplicated from filters for quick listing UI). */
    private String category;

    @Column(nullable = false)
    @Builder.Default
    private boolean freshlyImportedOnly = false;

    @Column(nullable = false)
    @Builder.Default
    private boolean notifyEnabled = true;

    @Column(nullable = false)
    @Builder.Default
    private int lastMatchCount = 0;

    @Column(nullable = false)
    @Builder.Default
    private int newMatchesSinceLastView = 0;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    /** Dernière exécution du matching worker pour cette recherche. Sert de curseur
     *  pour ne matcher que les listings publiées après ce point. */
    private Instant lastScanAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
        if (lastScanAt == null) lastScanAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
