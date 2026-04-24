package com.kargo.api.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kargo.api.dto.Dtos.ListingDto;
import com.kargo.api.dto.Dtos.RentalListingDto;
import com.kargo.api.dto.Dtos.UserDto;
import com.kargo.api.model.Listing;
import com.kargo.api.model.RentalListing;
import com.kargo.api.model.User;
import com.kargo.api.repository.ListingRepository;
import com.kargo.api.repository.RentalListingRepository;
import com.kargo.api.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Endpoints administration. Actuellement permit-all (la console admin n'a pas
 * encore d'auth JWT côté Spring — à durcir avec un role admin en V2).
 */
@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final ListingRepository listings;
    private final RentalListingRepository rentals;
    private final UserRepository users;
    private final ObjectMapper mapper = new ObjectMapper();

    public AdminController(
            ListingRepository listings,
            RentalListingRepository rentals,
            UserRepository users
    ) {
        this.listings = listings;
        this.rentals = rentals;
        this.users = users;
    }

    // -------------------- LISTINGS --------------------

    /** Toutes les annonces, tous statuts confondus (y compris pending/rejected/sold). */
    @GetMapping("/listings")
    public List<ListingDto> allListings(@RequestParam(required = false) String status) {
        List<Listing> all = listings.findAll();
        return all.stream()
                .filter(l -> status == null || status.isBlank() || status.equalsIgnoreCase(l.getStatus()))
                .sorted((a, b) -> {
                    var pa = a.getPublishedAt();
                    var pb = b.getPublishedAt();
                    if (pa == null && pb == null) return 0;
                    if (pa == null) return 1;
                    if (pb == null) return -1;
                    return pb.compareTo(pa);
                })
                .map(l -> ListingDto.of(l, parseUrls(l)))
                .toList();
    }

    /** Change le status d'une annonce (modération). */
    @PatchMapping("/listings/{id}/status")
    public ResponseEntity<?> setListingStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body
    ) {
        String status = body.get("status");
        if (status == null || status.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "status_required"));
        }
        String normalized = status.toLowerCase().trim();
        if (!List.of("pending", "active", "rejected", "sold", "draft").contains(normalized)) {
            return ResponseEntity.badRequest().body(Map.of("error", "invalid_status"));
        }
        return listings.findById(id)
                .map(l -> {
                    l.setStatus(normalized);
                    listings.save(l);
                    return ResponseEntity.ok(ListingDto.of(l, parseUrls(l)));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // -------------------- RENTAL LISTINGS --------------------

    /** Toutes les annonces de location, tous statuts confondus. */
    @GetMapping("/rental-listings")
    public List<RentalListingDto> allRentals(@RequestParam(required = false) String status) {
        List<RentalListing> all = rentals.findAll();
        return all.stream()
                .filter(r -> status == null || status.isBlank() || status.equalsIgnoreCase(r.getStatus()))
                .sorted((a, b) -> {
                    var pa = a.getCreatedAt();
                    var pb = b.getCreatedAt();
                    if (pa == null && pb == null) return 0;
                    if (pa == null) return 1;
                    if (pb == null) return -1;
                    return pb.compareTo(pa);
                })
                .map(r -> RentalListingDto.of(r, parseUrls(r.getPhotoUrlsJson())))
                .toList();
    }

    /** Change le status d'une annonce de location (modération). */
    @PatchMapping("/rental-listings/{id}/status")
    public ResponseEntity<?> setRentalStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body
    ) {
        String status = body.get("status");
        if (status == null || status.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "status_required"));
        }
        String normalized = status.toLowerCase().trim();
        if (!List.of("pending", "active", "rejected", "archived").contains(normalized)) {
            return ResponseEntity.badRequest().body(Map.of("error", "invalid_status"));
        }
        return rentals.findById(id)
                .map(r -> {
                    r.setStatus(normalized);
                    rentals.save(r);
                    return ResponseEntity.ok(RentalListingDto.of(r, parseUrls(r.getPhotoUrlsJson())));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // -------------------- USERS --------------------

    /** Liste complète des users avec compteur d'annonces + vues agrégées. */
    @GetMapping("/users")
    public List<AdminUserRow> allUsers() {
        List<User> all = users.findAll();
        return all.stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(u -> {
                    List<Listing> ls = listings.findBySellerOrderByPublishedAtDesc(u);
                    int totalViews = ls.stream()
                            .mapToInt(l -> l.getViewCount() == null ? 0 : l.getViewCount())
                            .sum();
                    int totalContacts = ls.stream()
                            .mapToInt(l -> l.getContactCount() == null ? 0 : l.getContactCount())
                            .sum();
                    return new AdminUserRow(
                            UserDto.of(u),
                            ls.size(),
                            (int) ls.stream().filter(l -> "active".equals(l.getStatus())).count(),
                            (int) ls.stream().filter(l -> "pending".equals(l.getStatus())).count(),
                            totalViews,
                            totalContacts
                    );
                })
                .toList();
    }

    /** Détail d'un user + ses annonces (pour la page admin user-profile). */
    @GetMapping("/users/{id}")
    public ResponseEntity<AdminUserDetail> userDetail(@PathVariable UUID id) {
        return users.findById(id)
                .map(u -> {
                    List<Listing> ls = listings.findBySellerOrderByPublishedAtDesc(u);
                    List<ListingDto> listingDtos = ls.stream()
                            .map(l -> ListingDto.of(l, parseUrls(l)))
                            .toList();
                    int totalViews = ls.stream()
                            .mapToInt(l -> l.getViewCount() == null ? 0 : l.getViewCount())
                            .sum();
                    int totalContacts = ls.stream()
                            .mapToInt(l -> l.getContactCount() == null ? 0 : l.getContactCount())
                            .sum();
                    return ResponseEntity.ok(new AdminUserDetail(
                            UserDto.of(u),
                            listingDtos,
                            totalViews,
                            totalContacts
                    ));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // -------------------- Helpers --------------------

    private List<String> parseUrls(Listing l) {
        return parseUrls(l.getPhotoUrlsJson());
    }

    private List<String> parseUrls(String json) {
        try {
            if (json == null) return Collections.emptyList();
            return mapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    // -------------------- Nested records --------------------

    public record AdminUserRow(
            UserDto user,
            int listingsTotal,
            int listingsActive,
            int listingsPending,
            int totalViews,
            int totalContacts
    ) {}

    public record AdminUserDetail(
            UserDto user,
            List<ListingDto> listings,
            int totalViews,
            int totalContacts
    ) {}
}
