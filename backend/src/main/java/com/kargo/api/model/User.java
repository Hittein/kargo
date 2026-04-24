package com.kargo.api.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "users", uniqueConstraints = @UniqueConstraint(columnNames = "phone"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false, unique = true)
    private String phone;

    @Column(nullable = false)
    private String name;

    private String email;
    private String city;
    private String avatarUrl;

    @Column(nullable = false)
    private boolean phoneVerified;

    @Column(nullable = false)
    private boolean emailVerified;

    @Column(nullable = false)
    @Builder.Default
    private int kycLevel = 0;

    @Column(nullable = false)
    @Builder.Default
    private boolean hasPin = false;

    @Column(nullable = false)
    @Builder.Default
    private boolean hasBiometric = false;

    @Column(nullable = false)
    @Builder.Default
    private int trustScore = 50;

    @Column(nullable = false)
    @Builder.Default
    private String role = "user"; // user | admin | merchant

    /** active | suspended | pending_review. Nullable dans la DB pour permettre
     *  ddl-auto=update d'ajouter la colonne sur une base existante (les lignes
     *  héritées lues comme null sont traitées comme "active" dans le code). */
    @Builder.Default
    private String status = "active";

    private Instant suspendedAt;

    @Column(length = 500)
    private String suspendReason;

    @Column(nullable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
    }
}
