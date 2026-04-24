package com.kargo.api.repository;

import com.kargo.api.model.Ticket;
import com.kargo.api.model.Trip;
import com.kargo.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TicketRepository extends JpaRepository<Ticket, UUID> {
    List<Ticket> findByUserOrderByCreatedAtDesc(User user);

    List<Ticket> findByTripOrderByCreatedAtDesc(Trip trip);
}
