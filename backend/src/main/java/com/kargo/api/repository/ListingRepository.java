package com.kargo.api.repository;

import com.kargo.api.model.Listing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.UUID;

public interface ListingRepository extends JpaRepository<Listing, UUID> {
    @Query("select l from Listing l where l.status = 'active' order by l.publishedAt desc")
    List<Listing> findAllActive();
}
