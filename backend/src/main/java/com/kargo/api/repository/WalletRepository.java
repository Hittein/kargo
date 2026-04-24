package com.kargo.api.repository;

import com.kargo.api.model.Wallet;
import com.kargo.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface WalletRepository extends JpaRepository<Wallet, UUID> {
    Optional<Wallet> findByUser(User user);
}
