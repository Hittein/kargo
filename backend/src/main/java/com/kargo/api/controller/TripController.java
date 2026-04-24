package com.kargo.api.controller;

import com.kargo.api.dto.Dtos.TripDto;
import com.kargo.api.repository.TripRepository;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;

@RestController
@RequestMapping("/api/v1/trips")
public class TripController {

    private final TripRepository trips;

    public TripController(TripRepository trips) {
        this.trips = trips;
    }

    @GetMapping
    public List<TripDto> search(
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam(required = false) String date
    ) {
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
}
