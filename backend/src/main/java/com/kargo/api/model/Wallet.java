package com.kargo.api.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "wallets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Wallet {
    @Id
    @GeneratedValue
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    @Builder.Default
    private long balanceMru = 0;

    @Column(nullable = false)
    @Builder.Default
    private long points = 0;

    @Column(nullable = false)
    @Builder.Default
    private boolean killSwitch = false;

    @Column(nullable = false)
    @Builder.Default
    private long dailyLimitMru = 100_000;

    @Column(nullable = false)
    @Builder.Default
    private long perTxLimitMru = 50_000;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    @PreUpdate
    void touch() {
        updatedAt = Instant.now();
    }
}
