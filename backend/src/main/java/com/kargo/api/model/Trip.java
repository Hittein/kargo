package com.kargo.api.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "trips")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Trip {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String companyId;

    @Column(nullable = false)
    private String fromCityId;

    @Column(nullable = false)
    private String toCityId;

    @Column(nullable = false)
    private String fromStop;

    @Column(nullable = false)
    private String toStop;

    @Column(nullable = false)
    private Instant departure;

    @Column(nullable = false)
    private Instant arrival;

    @Column(nullable = false)
    private int durationMin;

    @Column(nullable = false)
    private int distanceKm;

    @Column(nullable = false)
    private long priceMru;

    @Column(nullable = false)
    private int seatsTotal;

    @Column(nullable = false)
    private int seatsLeft;

    @Column(nullable = false)
    private String busSize;

    @Column(nullable = false)
    @Builder.Default
    private String status = "scheduled";
}
