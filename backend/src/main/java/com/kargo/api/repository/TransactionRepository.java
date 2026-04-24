package com.kargo.api.repository;

import com.kargo.api.model.Transaction;
import com.kargo.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {
    List<Transaction> findByUserOrderByCreatedAtDesc(User user);
}
