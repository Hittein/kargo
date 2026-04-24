package com.kargo.api.repository;

import com.kargo.api.model.Listing;
import com.kargo.api.model.ListingView;
import com.kargo.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface ListingViewRepository extends JpaRepository<ListingView, UUID> {

    List<ListingView> findByListingOrderByViewedAtDesc(Listing listing);

    List<ListingView> findByViewerOrderByViewedAtDesc(User viewer);

    /** Viewers distincts + dernière vue + nombre de vues par viewer sur une annonce donnée. */
    @Query("""
            select v.viewer.id, max(v.viewedAt), count(v)
            from ListingView v
            where v.listing = :listing and v.viewer is not null
            group by v.viewer.id
            order by max(v.viewedAt) desc
            """)
    List<Object[]> aggregateViewersForListing(@Param("listing") Listing listing);
}
