package com.kargo.api.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "listings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Listing {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String brand;

    @Column(nullable = false)
    private String model;

    @Column(nullable = false)
    private int year;

    private Integer importYear;

    @Column(nullable = false)
    private int ownersInCountry;

    @Column(nullable = false)
    private long priceMru;

    @Column(nullable = false)
    private int km;

    @Column(nullable = false)
    private String fuel;

    @Column(nullable = false)
    private String transmission;

    @Column(nullable = false)
    private String city;

    private String district;

    @Column(nullable = false)
    private String sellerName;

    @Column(nullable = false)
    private String sellerType;

    @Column(nullable = false)
    @Builder.Default
    private boolean verified = false;

    @Column(nullable = false)
    @Builder.Default
    private boolean vinVerified = false;

    @Column(nullable = false)
    @Builder.Default
    private boolean kargoVerified = false;

    @Column(nullable = false)
    private int photos;

    @Column(nullable = false, length = 8000)
    private String photoUrlsJson;

    @Column(nullable = false)
    @Builder.Default
    private int viewCount = 0;

    @Column(nullable = false)
    @Builder.Default
    private int contactCount = 0;

    @Column(nullable = false)
    @Builder.Default
    private int favoriteCount = 0;

    @Column(nullable = false)
    @Builder.Default
    private String status = "active";

    @Column(nullable = false)
    private Instant publishedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    private User seller;

    @PrePersist
    void onCreate() {
        if (publishedAt == null) publishedAt = Instant.now();
    }
}
