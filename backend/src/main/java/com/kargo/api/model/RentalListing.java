package com.kargo.api.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "rental_listings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RentalListing {
    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;

    @Column(nullable = false)
    private String brand;

    @Column(nullable = false)
    private String model;

    @Column(nullable = false)
    private int year;

    @Column(nullable = false)
    private String category; // economique | standard | premium | 4x4 | utilitaire

    @Column(nullable = false)
    private long pricePerDayMru;

    private Long priceWeeklyMru;
    private Long priceMonthlyMru;

    @Column(nullable = false)
    @Builder.Default
    private int seats = 5;

    @Column(nullable = false)
    private String transmission; // manual | auto

    @Column(nullable = false)
    @Builder.Default
    private boolean airCon = true;

    @Column(nullable = false)
    @Builder.Default
    private int minDays = 1;

    @Column(nullable = false)
    @Builder.Default
    private long depositMru = 50_000;

    @Column(nullable = false)
    @Builder.Default
    private int kmIncludedPerDay = 200;

    @Column(nullable = false)
    @Builder.Default
    private int extraKmMru = 30;

    @Column(nullable = false)
    @Builder.Default
    private boolean chauffeurAvailable = false;

    private Long chauffeurPricePerDayMru;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    @Builder.Default
    private String status = "active";

    @Column(nullable = false)
    @Builder.Default
    private int photos = 0;

    @Column(nullable = false, length = 8000)
    @Builder.Default
    private String photoUrlsJson = "[]";

    @Column(nullable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() { if (createdAt == null) createdAt = Instant.now(); }
}
