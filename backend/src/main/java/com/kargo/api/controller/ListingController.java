package com.kargo.api.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kargo.api.dto.Dtos.CreateListingRequest;
import com.kargo.api.dto.Dtos.ListingDto;
import com.kargo.api.model.Listing;
import com.kargo.api.model.ListingView;
import com.kargo.api.model.User;
import com.kargo.api.repository.ListingRepository;
import com.kargo.api.repository.ListingViewRepository;
import com.kargo.api.service.ActivityLogger;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/listings")
public class ListingController {

    private final ListingRepository listings;
    private final ListingViewRepository views;
    private final ActivityLogger activity;
    private final ObjectMapper mapper = new ObjectMapper();

    public ListingController(
            ListingRepository listings,
            ListingViewRepository views,
            ActivityLogger activity
    ) {
        this.listings = listings;
        this.views = views;
        this.activity = activity;
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
    public ResponseEntity<?> create(
            @AuthenticationPrincipal User principal,
            @RequestBody CreateListingRequest body
    ) {
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
                    .seller(principal)
                    .build();
            Listing saved = listings.save(l);
            activity.record(principal, "PUBLISH_LISTING",
                    String.format("A publié %s %s %d", saved.getBrand(), saved.getModel(), saved.getYear()),
                    Map.of("listingId", saved.getId().toString(), "priceMru", saved.getPriceMru()));
            return ResponseEntity.ok(ListingDto.of(saved, parseUrls(saved)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("invalid_payload");
        }
    }

    /** Incrémente le compteur de vues + crée une ligne ListingView si user authentifié. */
    @PostMapping("/{id}/view")
    public ResponseEntity<Void> trackView(
            @AuthenticationPrincipal User principal,
            @PathVariable UUID id
    ) {
        listings.findById(id).ifPresent(l -> {
            int current = l.getViewCount() == null ? 0 : l.getViewCount();
            l.setViewCount(current + 1);
            listings.save(l);

            // Empêche un seller de polluer ses propres stats.
            boolean isOwner = principal != null && l.getSeller() != null
                    && l.getSeller().getId().equals(principal.getId());
            if (!isOwner) {
                views.save(ListingView.builder()
                        .listing(l)
                        .viewer(principal) // null OK pour visiteur anonyme
                        .build());
                if (principal != null) {
                    activity.record(principal, "VIEW_LISTING",
                            String.format("A consulté %s %s", l.getBrand(), l.getModel()),
                            Map.of("listingId", l.getId().toString()));
                }
            }
        });
        return ResponseEntity.noContent().build();
    }

    /** Incrémente le compteur de contacts (tap sur Appeler/WhatsApp/Chat). */
    @PostMapping("/{id}/contact")
    public ResponseEntity<Void> trackContact(
            @AuthenticationPrincipal User principal,
            @PathVariable UUID id
    ) {
        listings.findById(id).ifPresent(l -> {
            int current = l.getContactCount() == null ? 0 : l.getContactCount();
            l.setContactCount(current + 1);
            listings.save(l);
            if (principal != null) {
                activity.record(principal, "CONTACT_LISTING",
                        String.format("A contacté le vendeur de %s %s", l.getBrand(), l.getModel()),
                        Map.of("listingId", l.getId().toString()));
            }
        });
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal User principal,
            @PathVariable UUID id
    ) {
        if (principal == null) return ResponseEntity.status(401).build();
        return listings.findById(id)
                .filter(l -> l.getSeller() != null && l.getSeller().getId().equals(principal.getId()))
                .map(l -> {
                    listings.deleteById(id);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.status(403).build());
    }

    private List<String> parseUrls(Listing l) {
        try {
            return mapper.readValue(l.getPhotoUrlsJson(), new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}
