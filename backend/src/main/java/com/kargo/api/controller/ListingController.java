package com.kargo.api.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kargo.api.dto.Dtos.ListingDto;
import com.kargo.api.model.Listing;
import com.kargo.api.repository.ListingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/listings")
public class ListingController {

    private final ListingRepository listings;
    private final ObjectMapper mapper = new ObjectMapper();

    public ListingController(ListingRepository listings) {
        this.listings = listings;
    }

    @GetMapping
    public List<ListingDto> all() {
        return listings.findAllActive().stream().map(l -> ListingDto.of(l, parseUrls(l))).toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ListingDto> one(@PathVariable UUID id) {
        return listings.findById(id)
                .map(l -> ResponseEntity.ok(ListingDto.of(l, parseUrls(l))))
                .orElse(ResponseEntity.notFound().build());
    }

    private List<String> parseUrls(Listing l) {
        try {
            return mapper.readValue(l.getPhotoUrlsJson(), new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}
