package com.kargo.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kargo.api.model.Listing;
import com.kargo.api.model.SavedSearch;
import com.kargo.api.repository.ListingRepository;
import com.kargo.api.repository.SavedSearchRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Locale;

/**
 * Scan périodique : pour chaque saved search avec notifyEnabled,
 * compte les nouvelles listings publiées depuis le dernier scan qui matchent,
 * incrémente newMatchesSinceLastView, met à jour lastMatchCount et lastScanAt.
 */
@Service
public class SavedSearchMatchingService {

    private static final Logger log = LoggerFactory.getLogger(SavedSearchMatchingService.class);
    private final SavedSearchRepository searches;
    private final ListingRepository listings;
    private final ObjectMapper mapper = new ObjectMapper();

    public SavedSearchMatchingService(SavedSearchRepository searches, ListingRepository listings) {
        this.searches = searches;
        this.listings = listings;
    }

    /** Toutes les 60s. Configurable via MATCHING_WORKER_FIXED_RATE env (default 60000ms). */
    @Scheduled(fixedRateString = "${kargo.matching.fixed-rate:60000}", initialDelayString = "${kargo.matching.initial-delay:15000}")
    @Transactional
    public void scanAll() {
        List<SavedSearch> active = searches.findByNotifyEnabledTrue();
        if (active.isEmpty()) return;

        // On recompte aussi le total actif pour lastMatchCount (pas juste le delta).
        List<Listing> allActive = listings.findAllActive();
        Instant now = Instant.now();
        int totalDelta = 0;

        for (SavedSearch s : active) {
            JsonNode filters;
            try {
                filters = s.getFiltersJson() != null
                        ? mapper.readTree(s.getFiltersJson())
                        : mapper.createObjectNode();
            } catch (Exception e) {
                log.warn("saved-search {} filtersJson invalid: {}", s.getId(), e.getMessage());
                continue;
            }

            Instant since = s.getLastScanAt() != null ? s.getLastScanAt() : s.getCreatedAt();

            int totalMatches = 0;
            int newMatches = 0;
            for (Listing l : allActive) {
                if (!matches(l, filters)) continue;
                totalMatches++;
                if (l.getPublishedAt() != null && l.getPublishedAt().isAfter(since)) {
                    newMatches++;
                }
            }

            if (newMatches > 0 || s.getLastMatchCount() != totalMatches) {
                s.setLastMatchCount(totalMatches);
                if (newMatches > 0) {
                    s.setNewMatchesSinceLastView(s.getNewMatchesSinceLastView() + newMatches);
                    totalDelta += newMatches;
                }
            }
            s.setLastScanAt(now);
            searches.save(s);
        }

        if (totalDelta > 0) {
            log.info("saved-search matching: {} searches scanned, {} new matches total", active.size(), totalDelta);
        }
    }

    /** Test d'appartenance d'une listing à un snapshot de filtres VehicleFilters (JSON). */
    boolean matches(Listing l, JsonNode f) {
        if (l == null || f == null) return false;

        String query = textOrNull(f, "query");
        if (query != null && !query.isBlank()) {
            String hay = (nullSafe(l.getBrand()) + " " + nullSafe(l.getModel()) + " " + nullSafe(l.getCity()))
                    .toLowerCase(Locale.ROOT);
            if (!hay.contains(query.trim().toLowerCase(Locale.ROOT))) return false;
        }

        String brand = textOrNull(f, "brand");
        if (brand != null && !brand.equalsIgnoreCase(l.getBrand())) return false;

        String model = textOrNull(f, "model");
        if (model != null && !model.equalsIgnoreCase(l.getModel())) return false;

        Long minPrice = longOrNull(f, "minPrice");
        if (minPrice != null && l.getPriceMru() < minPrice) return false;
        Long maxPrice = longOrNull(f, "maxPrice");
        if (maxPrice != null && l.getPriceMru() > maxPrice) return false;

        Integer minYear = intOrNull(f, "minYear");
        if (minYear != null && l.getYear() < minYear) return false;
        Integer maxYear = intOrNull(f, "maxYear");
        if (maxYear != null && l.getYear() > maxYear) return false;

        Integer minKm = intOrNull(f, "minKm");
        if (minKm != null && l.getKm() < minKm) return false;
        Integer maxKm = intOrNull(f, "maxKm");
        if (maxKm != null && l.getKm() > maxKm) return false;

        if (!arrayContainsIgnoreCase(f.get("fuel"), l.getFuel())) return false;
        if (!arrayContainsIgnoreCase(f.get("transmission"), l.getTransmission())) return false;
        if (!arrayContainsIgnoreCase(f.get("city"), l.getCity())) return false;

        if (f.has("verifiedOnly") && f.get("verifiedOnly").asBoolean(false) && !l.isVerified()) return false;
        if (f.has("kargoVerifiedOnly") && f.get("kargoVerifiedOnly").asBoolean(false) && !l.isKargoVerified()) return false;

        // aiVerdict: pas stocké sur Listing — on le skip côté backend.
        return true;
    }

    private static String textOrNull(JsonNode n, String field) {
        JsonNode v = n.get(field);
        return v == null || v.isNull() ? null : v.asText(null);
    }

    private static Integer intOrNull(JsonNode n, String field) {
        JsonNode v = n.get(field);
        return v == null || v.isNull() ? null : v.intValue();
    }

    private static Long longOrNull(JsonNode n, String field) {
        JsonNode v = n.get(field);
        return v == null || v.isNull() ? null : v.longValue();
    }

    private static String nullSafe(String s) {
        return s == null ? "" : s;
    }

    /** Retourne true si le tableau est absent/vide (pas de filtre), sinon true si contient (case-insensitive). */
    private static boolean arrayContainsIgnoreCase(JsonNode arr, String value) {
        if (arr == null || !arr.isArray() || arr.isEmpty()) return true;
        if (value == null) return false;
        for (JsonNode n : arr) {
            if (n != null && !n.isNull() && value.equalsIgnoreCase(n.asText(""))) return true;
        }
        return false;
    }
}
