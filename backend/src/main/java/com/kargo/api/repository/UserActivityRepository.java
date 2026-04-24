package com.kargo.api.repository;

import com.kargo.api.model.User;
import com.kargo.api.model.UserActivity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface UserActivityRepository extends JpaRepository<UserActivity, UUID> {
    List<UserActivity> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
}
