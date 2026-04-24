package com.kargo.api.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "companies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Company {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type; // transit | rental

    @Column(nullable = false)
    private String city;

    private String contact;
    private String logoUrl;

    @Column(nullable = false)
    @Builder.Default
    private double rating = 4.0;

    @Column(nullable = false)
    @Builder.Default
    private int fleetSize = 0;

    @Column(nullable = false)
    @Builder.Default
    private String status = "active"; // active | paused | kyc_pending

    @Column(nullable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() { if (createdAt == null) createdAt = Instant.now(); }
}
