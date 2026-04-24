package com.kargo.api.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kargo.api.dto.Dtos.*;
import com.kargo.api.model.Company;
import com.kargo.api.model.RentalListing;
import com.kargo.api.repository.CompanyRepository;
import com.kargo.api.repository.RentalListingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/rental-listings")
public class RentalListingController {

    private final RentalListingRepository rentals;
    private final CompanyRepository companies;
    private final ObjectMapper mapper = new ObjectMapper();

    public RentalListingController(RentalListingRepository rentals, CompanyRepository companies) {
        this.rentals = rentals;
        this.companies = companies;
    }

    @GetMapping
    public List<RentalListingDto> all() {
        return rentals.findAllActive().stream().map(r -> RentalListingDto.of(r, parseUrls(r.getPhotoUrlsJson()))).toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<RentalListingDto> one(@PathVariable UUID id) {
        return rentals.findById(id)
                .map(r -> ResponseEntity.ok(RentalListingDto.of(r, parseUrls(r.getPhotoUrlsJson()))))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody CreateRentalListingRequest body) {
        Company company = null;
        if (body.companyId() != null) {
            company = companies.findById(UUID.fromString(body.companyId())).orElse(null);
        }
        try {
            String urlsJson = mapper.writeValueAsString(body.photoUrls() == null ? List.of() : body.photoUrls());
            int photoCount = body.photoUrls() == null ? 0 : body.photoUrls().size();
            RentalListing r = RentalListing.builder()
                    .company(company)
                    .brand(body.brand())
                    .model(body.model())
                    .year(body.year())
                    .category(body.category())
                    .pricePerDayMru(body.pricePerDayMru())
                    .priceWeeklyMru(body.priceWeeklyMru())
                    .priceMonthlyMru(body.priceMonthlyMru())
                    .seats(body.seats())
                    .transmission(body.transmission())
                    .airCon(body.airCon())
                    .minDays(body.minDays() != null ? body.minDays() : 1)
                    .depositMru(body.depositMru() != null ? body.depositMru() : 50_000L)
                    .kmIncludedPerDay(body.kmIncludedPerDay() != null ? body.kmIncludedPerDay() : 200)
                    .extraKmMru(body.extraKmMru() != null ? body.extraKmMru() : 30)
                    .chauffeurAvailable(body.chauffeurAvailable())
                    .chauffeurPricePerDayMru(body.chauffeurPricePerDayMru())
                    .city(body.city())
                    .photos(photoCount)
                    .photoUrlsJson(urlsJson)
                    .build();
            RentalListing saved = rentals.save(r);
            return ResponseEntity.ok(RentalListingDto.of(saved, parseUrls(saved.getPhotoUrlsJson())));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("invalid_payload");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        rentals.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private List<String> parseUrls(String json) {
        try {
            return mapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}
