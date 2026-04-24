package com.kargo.api.repository;

import com.kargo.api.model.RentalListing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.UUID;

public interface RentalListingRepository extends JpaRepository<RentalListing, UUID> {
    @Query("select r from RentalListing r where r.status = 'active' order by r.createdAt desc")
    List<RentalListing> findAllActive();
}
