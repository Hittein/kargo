package com.kargo.api.controller;

import com.kargo.api.dto.Dtos.CreateTripRequest;
import com.kargo.api.dto.Dtos.TripDto;
import com.kargo.api.model.Trip;
import com.kargo.api.repository.TripRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/trips")
public class TripController {

    private final TripRepository trips;

    public TripController(TripRepository trips) {
        this.trips = trips;
    }

    @GetMapping
    public List<TripDto> search(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(required = false) String date
    ) {
        if (from == null || to == null) {
            return trips.findAll().stream().map(TripDto::of).toList();
        }
        Instant start;
        Instant end;
        if (date != null) {
            LocalDate d = LocalDate.parse(date);
            start = d.atStartOfDay(ZoneOffset.UTC).toInstant();
            end = d.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();
        } else {
            start = Instant.now().minusSeconds(3600);
            end = Instant.now().plusSeconds(86_400 * 30);
        }
        return trips.search(from, to, start, end).stream().map(TripDto::of).toList();
    }

    @PostMapping
    public ResponseEntity<TripDto> create(@RequestBody CreateTripRequest body) {
        Trip t = Trip.builder()
                .companyId(body.companyId())
                .fromCityId(body.fromCityId())
                .toCityId(body.toCityId())
                .fromStop(body.fromStop())
                .toStop(body.toStop())
                .departure(body.departure())
                .arrival(body.arrival())
                .durationMin(body.durationMin())
                .distanceKm(body.distanceKm())
                .priceMru(body.priceMru())
                .seatsTotal(body.seatsTotal())
                .seatsLeft(body.seatsTotal())
                .busSize(body.busSize())
                .build();
        return ResponseEntity.ok(TripDto.of(trips.save(t)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        trips.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
