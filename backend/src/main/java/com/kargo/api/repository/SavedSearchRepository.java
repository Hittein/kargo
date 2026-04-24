package com.kargo.api.repository;

import com.kargo.api.model.SavedSearch;
import com.kargo.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SavedSearchRepository extends JpaRepository<SavedSearch, UUID> {
    List<SavedSearch> findByUserOrderByCreatedAtDesc(User user);

    List<SavedSearch> findByNotifyEnabledTrue();
}
