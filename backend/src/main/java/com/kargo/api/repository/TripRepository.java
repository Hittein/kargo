package com.kargo.api.repository;

import com.kargo.api.model.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface TripRepository extends JpaRepository<Trip, UUID> {
    @Query("select t from Trip t where t.fromCityId = :from and t.toCityId = :to and t.departure between :start and :end order by t.departure asc")
    List<Trip> search(@Param("from") String from, @Param("to") String to, @Param("start") Instant start, @Param("end") Instant end);
}
