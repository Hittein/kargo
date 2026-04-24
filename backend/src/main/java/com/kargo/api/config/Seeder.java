package com.kargo.api.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kargo.api.model.Listing;
import com.kargo.api.model.Trip;
import com.kargo.api.repository.ListingRepository;
import com.kargo.api.repository.TripRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Configuration
public class Seeder {

    @Bean
    CommandLineRunner seed(ListingRepository listings, TripRepository trips, ObjectMapper mapper) {
        return args -> {
            if (listings.count() == 0) {
                List<String> suvUrls = List.of(
                        "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=900&q=70",
                        "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=900&q=70",
                        "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=900&q=70",
                        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=900&q=70"
                );
                List<String> pickupUrls = List.of(
                        "https://images.unsplash.com/photo-1595923533867-9dac6e2c5dec?w=900&q=70",
                        "https://images.unsplash.com/photo-1605515298946-d0573716f0bd?w=900&q=70"
                );
                listings.saveAll(List.of(
                        Listing.builder().brand("Hyundai").model("Tucson").year(2020).importYear(2021).ownersInCountry(1)
                                .priceMru(1_200_000).km(32_000).fuel("diesel").transmission("auto")
                                .city("Nouakchott").district("Sebkha").sellerName("Nouakchott Motors").sellerType("pro")
                                .verified(true).vinVerified(true).kargoVerified(true)
                                .photos(suvUrls.size()).photoUrlsJson(mapper.writeValueAsString(suvUrls)).build(),
                        Listing.builder().brand("Toyota").model("Hilux").year(2021).importYear(2026).ownersInCountry(0)
                                .priceMru(2_450_000).km(28_000).fuel("diesel").transmission("manual")
                                .city("Nouakchott").district("Ksar").sellerName("Sahara Trucks").sellerType("pro")
                                .verified(true).vinVerified(true).kargoVerified(true)
                                .photos(pickupUrls.size()).photoUrlsJson(mapper.writeValueAsString(pickupUrls)).build(),
                        Listing.builder().brand("Toyota").model("Yaris").year(2018).importYear(2019).ownersInCountry(2)
                                .priceMru(450_000).km(45_000).fuel("petrol").transmission("auto")
                                .city("Nouakchott").district("Tevragh Zeina").sellerName("Ahmed O.").sellerType("particulier")
                                .verified(true).vinVerified(true).kargoVerified(false)
                                .photos(suvUrls.size()).photoUrlsJson(mapper.writeValueAsString(suvUrls)).build()
                ));
            }
            if (trips.count() == 0) {
                Instant base = Instant.now().truncatedTo(ChronoUnit.HOURS);
                trips.saveAll(List.of(
                        Trip.builder().companyId("elbourrak").fromCityId("nkt").toCityId("ndb")
                                .fromStop("Gare du Ksar").toStop("Gare centrale")
                                .departure(base.plus(6, ChronoUnit.HOURS)).arrival(base.plus(12, ChronoUnit.HOURS))
                                .durationMin(360).distanceKm(470).priceMru(4500)
                                .seatsTotal(55).seatsLeft(12).busSize("big").status("scheduled").build(),
                        Trip.builder().companyId("sonef").fromCityId("nkt").toCityId("kif")
                                .fromStop("Gare du Ksar").toStop("Centre-ville")
                                .departure(base.plus(2, ChronoUnit.HOURS)).arrival(base.plus(10, ChronoUnit.HOURS))
                                .durationMin(480).distanceKm(600).priceMru(3500)
                                .seatsTotal(45).seatsLeft(4).busSize("medium").status("boarding").build(),
                        Trip.builder().companyId("stpn").fromCityId("nkt").toCityId("atr")
                                .fromStop("Gare Madrid").toStop("Centre Atar")
                                .departure(base.plus(1, ChronoUnit.HOURS)).arrival(base.plus(9, ChronoUnit.HOURS))
                                .durationMin(480).distanceKm(450).priceMru(5500)
                                .seatsTotal(30).seatsLeft(0).busSize("small").status("in_transit").build()
                ));
            }
        };
    }
}
