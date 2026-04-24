package com.kargo.api.repository;

import com.kargo.api.model.OtpChallenge;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface OtpChallengeRepository extends JpaRepository<OtpChallenge, UUID> {
    Optional<OtpChallenge> findFirstByPhoneAndConsumedFalseOrderByCreatedAtDesc(String phone);
}
