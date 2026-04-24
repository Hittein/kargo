package com.kargo.api.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kargo.api.dto.Dtos.CreateListingRequest;
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

    @PostMapping
    public ResponseEntity<?> create(@RequestBody CreateListingRequest body) {
        try {
            String urlsJson = mapper.writeValueAsString(body.photoUrls() == null ? List.of() : body.photoUrls());
            int photoCount = body.photoUrls() == null ? 0 : body.photoUrls().size();
            Listing l = Listing.builder()
                    .brand(body.brand()).model(body.model()).year(body.year())
                    .importYear(body.importYear()).ownersInCountry(body.ownersInCountry())
                    .priceMru(body.priceMru()).km(body.km()).fuel(body.fuel())
                    .transmission(body.transmission()).city(body.city()).district(body.district())
                    .sellerName(body.sellerName()).sellerType(body.sellerType())
                    .verified(true).vinVerified(false).kargoVerified(body.kargoVerified())
                    .photos(photoCount).photoUrlsJson(urlsJson)
                    .build();
            Listing saved = listings.save(l);
            return ResponseEntity.ok(ListingDto.of(saved, parseUrls(saved)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("invalid_payload");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        listings.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private List<String> parseUrls(Listing l) {
        try {
            return mapper.readValue(l.getPhotoUrlsJson(), new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}
