package com.kargo.api.repository;

import com.kargo.api.model.Listing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface ListingRepository extends JpaRepository<Listing, UUID> {
    @Query("select l from Listing l where l.status = 'active' order by l.publishedAt desc")
    List<Listing> findAllActive();

    @Query("select l from Listing l where l.status = 'active' and l.publishedAt > :since order by l.publishedAt desc")
    List<Listing> findActivePublishedAfter(@Param("since") Instant since);
}
