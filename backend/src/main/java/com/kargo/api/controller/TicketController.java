package com.kargo.api.controller;

import com.kargo.api.dto.Dtos.TicketDto;
import com.kargo.api.dto.Dtos.CreateTicketRequest;
import com.kargo.api.model.Ticket;
import com.kargo.api.model.Trip;
import com.kargo.api.model.User;
import com.kargo.api.repository.TicketRepository;
import com.kargo.api.repository.TripRepository;
import com.kargo.api.service.ActivityLogger;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tickets")
public class TicketController {

    private final TicketRepository tickets;
    private final TripRepository trips;
    private final ActivityLogger activity;

    public TicketController(
            TicketRepository tickets,
            TripRepository trips,
            ActivityLogger activity
    ) {
        this.tickets = tickets;
        this.trips = trips;
        this.activity = activity;
    }

    /** Crée un billet serveur-side (le mobile continue de gérer wallet/points en local). */
    @PostMapping
    @Transactional
    public ResponseEntity<?> book(
            @AuthenticationPrincipal User principal,
            @RequestBody CreateTicketRequest body
    ) {
        if (principal == null) return ResponseEntity.status(401).build();
        if (body.tripId() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "tripId_required"));
        }
        UUID tripUuid;
        try {
            tripUuid = UUID.fromString(body.tripId());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "tripId_invalid"));
        }
        Trip trip = trips.findById(tripUuid).orElse(null);
        if (trip == null) return ResponseEntity.status(404).body(Map.of("error", "trip_not_found"));

        int seats = body.seatsBooked() > 0 ? body.seatsBooked() : 1;
        if (trip.getSeatsLeft() < seats) {
            return ResponseEntity.status(409).body(Map.of("error", "not_enough_seats"));
        }
        trip.setSeatsLeft(trip.getSeatsLeft() - seats);
        trips.save(trip);

        Ticket t = Ticket.builder()
                .user(principal)
                .trip(trip)
                .seatsBooked(seats)
                .totalPaidMru(body.totalPaidMru())
                .paymentMethod(body.paymentMethod() != null ? body.paymentMethod() : "unknown")
                .status("paid")
                .qrToken(body.qrToken())
                .build();
        Ticket saved = tickets.save(t);

        activity.record(principal, "BOOK_TRIP",
                String.format("A acheté %d billet%s pour %s → %s",
                        seats, seats > 1 ? "s" : "",
                        trip.getFromCityId(), trip.getToCityId()),
                Map.of(
                        "tripId", trip.getId().toString(),
                        "ticketId", saved.getId().toString(),
                        "totalPaidMru", body.totalPaidMru()
                ));
        return ResponseEntity.ok(TicketDto.of(saved));
    }

    @GetMapping("/me")
    public ResponseEntity<List<TicketDto>> mine(@AuthenticationPrincipal User principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        List<TicketDto> out = tickets.findByUserOrderByCreatedAtDesc(principal)
                .stream().map(TicketDto::of).toList();
        return ResponseEntity.ok(out);
    }
}
