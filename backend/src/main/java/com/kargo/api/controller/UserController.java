package com.kargo.api.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kargo.api.dto.Dtos.*;
import com.kargo.api.model.Listing;
import com.kargo.api.model.User;
import com.kargo.api.repository.ListingRepository;
import com.kargo.api.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserRepository users;
    private final ListingRepository listings;
    private final ObjectMapper mapper = new ObjectMapper();

    public UserController(UserRepository users, ListingRepository listings) {
        this.users = users;
        this.listings = listings;
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> me(@AuthenticationPrincipal User principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(UserDto.of(principal));
    }

    @PatchMapping("/me")
    public ResponseEntity<UserDto> update(
            @AuthenticationPrincipal User principal,
            @RequestBody UpdateProfileRequest body
    ) {
        if (principal == null) return ResponseEntity.status(401).build();
        if (body.name() != null) principal.setName(body.name());
        if (body.email() != null) principal.setEmail(body.email());
        if (body.city() != null) principal.setCity(body.city());
        users.save(principal);
        return ResponseEntity.ok(UserDto.of(principal));
    }

    /** Liste des annonces publiées par l'utilisateur courant (seller dashboard). */
    @GetMapping("/me/listings")
    public ResponseEntity<List<ListingDto>> myListings(@AuthenticationPrincipal User principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        List<ListingDto> out = listings.findBySellerOrderByPublishedAtDesc(principal)
                .stream()
                .map(l -> ListingDto.of(l, parseUrls(l)))
                .toList();
        return ResponseEntity.ok(out);
    }

    private List<String> parseUrls(Listing l) {
        try {
            return mapper.readValue(l.getPhotoUrlsJson(), new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}
