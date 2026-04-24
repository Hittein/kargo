package com.kargo.api.controller;

import com.kargo.api.dto.Dtos.CreateSavedSearchRequest;
import com.kargo.api.dto.Dtos.SavedSearchDto;
import com.kargo.api.dto.Dtos.UpdateSavedSearchRequest;
import com.kargo.api.model.SavedSearch;
import com.kargo.api.model.User;
import com.kargo.api.repository.SavedSearchRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/saved-searches")
public class SavedSearchController {

    private final SavedSearchRepository repo;

    public SavedSearchController(SavedSearchRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public ResponseEntity<List<SavedSearchDto>> list(@AuthenticationPrincipal User principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        List<SavedSearchDto> out = repo.findByUserOrderByCreatedAtDesc(principal)
                .stream().map(SavedSearchDto::of).toList();
        return ResponseEntity.ok(out);
    }

    @PostMapping
    public ResponseEntity<?> create(
            @AuthenticationPrincipal User principal,
            @RequestBody CreateSavedSearchRequest body
    ) {
        if (principal == null) return ResponseEntity.status(401).build();
        if (body.name() == null || body.name().isBlank()) {
            return ResponseEntity.badRequest().body("name_required");
        }
        if (body.filtersJson() == null) {
            return ResponseEntity.badRequest().body("filters_required");
        }
        SavedSearch s = SavedSearch.builder()
                .user(principal)
                .name(body.name().trim())
                .filtersJson(body.filtersJson())
                .sort(body.sort())
                .query(body.query())
                .category(body.category())
                .freshlyImportedOnly(Boolean.TRUE.equals(body.freshlyImportedOnly()))
                .notifyEnabled(body.notifyEnabled() == null || body.notifyEnabled())
                .build();
        SavedSearch saved = repo.save(s);
        return ResponseEntity.ok(SavedSearchDto.of(saved));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> update(
            @AuthenticationPrincipal User principal,
            @PathVariable UUID id,
            @RequestBody UpdateSavedSearchRequest body
    ) {
        if (principal == null) return ResponseEntity.status(401).build();
        return repo.findById(id)
                .filter(s -> s.getUser() != null && s.getUser().getId().equals(principal.getId()))
                .map(s -> {
                    if (body.name() != null) s.setName(body.name());
                    if (body.filtersJson() != null) s.setFiltersJson(body.filtersJson());
                    if (body.sort() != null) s.setSort(body.sort());
                    if (body.query() != null) s.setQuery(body.query());
                    if (body.category() != null) s.setCategory(body.category());
                    if (body.freshlyImportedOnly() != null) s.setFreshlyImportedOnly(body.freshlyImportedOnly());
                    if (body.notifyEnabled() != null) s.setNotifyEnabled(body.notifyEnabled());
                    repo.save(s);
                    return ResponseEntity.ok(SavedSearchDto.of(s));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/mark-viewed")
    public ResponseEntity<SavedSearchDto> markViewed(
            @AuthenticationPrincipal User principal,
            @PathVariable UUID id
    ) {
        if (principal == null) return ResponseEntity.status(401).build();
        return repo.findById(id)
                .filter(s -> s.getUser() != null && s.getUser().getId().equals(principal.getId()))
                .map(s -> {
                    s.setNewMatchesSinceLastView(0);
                    repo.save(s);
                    return ResponseEntity.ok(SavedSearchDto.of(s));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal User principal,
            @PathVariable UUID id
    ) {
        if (principal == null) return ResponseEntity.status(401).build();
        return repo.findById(id)
                .filter(s -> s.getUser() != null && s.getUser().getId().equals(principal.getId()))
                .map(s -> {
                    repo.deleteById(id);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
