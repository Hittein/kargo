package com.kargo.api.dto;

import com.kargo.api.model.User;
import com.kargo.api.model.Listing;
import com.kargo.api.model.Trip;
import com.kargo.api.model.Wallet;
import com.kargo.api.model.Transaction;
import com.kargo.api.model.Company;
import com.kargo.api.model.RentalListing;

import java.time.Instant;
import java.util.List;

public class Dtos {
    private Dtos() {}

    public record StartOtpRequest(String phone) {}
    public record VerifyOtpRequest(String phone, String code) {}
    public record AuthResponse(String token, UserDto user) {}

    public record UserDto(
            String id, String phone, String name, String email, String city, String avatarUrl,
            boolean phoneVerified, boolean emailVerified, int kycLevel,
            boolean hasPin, boolean hasBiometric, int trustScore, String role, Instant createdAt
    ) {
        public static UserDto of(User u) {
            return new UserDto(
                    u.getId().toString(), u.getPhone(), u.getName(), u.getEmail(), u.getCity(), u.getAvatarUrl(),
                    u.isPhoneVerified(), u.isEmailVerified(), u.getKycLevel(),
                    u.isHasPin(), u.isHasBiometric(), u.getTrustScore(), u.getRole(), u.getCreatedAt()
            );
        }
    }

    public record UpdateProfileRequest(String name, String email, String city) {}

    public record ListingDto(
            String id, String brand, String model, int year, Integer importYear, int ownersInCountry,
            long priceMru, int km, String fuel, String transmission, String city, String district,
            String sellerName, String sellerType, boolean verified, boolean vinVerified,
            boolean kargoVerified, int photos, List<String> photoUrls, String status, Instant publishedAt
    ) {
        public static ListingDto of(Listing l, List<String> urls) {
            return new ListingDto(
                    l.getId().toString(), l.getBrand(), l.getModel(), l.getYear(), l.getImportYear(),
                    l.getOwnersInCountry(), l.getPriceMru(), l.getKm(), l.getFuel(), l.getTransmission(),
                    l.getCity(), l.getDistrict(), l.getSellerName(), l.getSellerType(),
                    l.isVerified(), l.isVinVerified(), l.isKargoVerified(),
                    l.getPhotos(), urls, l.getStatus(), l.getPublishedAt()
            );
        }
    }

    public record TripDto(
            String id, String companyId, String fromCityId, String toCityId, String fromStop, String toStop,
            Instant departure, Instant arrival, int durationMin, int distanceKm, long priceMru,
            int seatsTotal, int seatsLeft, String busSize, String status
    ) {
        public static TripDto of(Trip t) {
            return new TripDto(
                    t.getId().toString(), t.getCompanyId(), t.getFromCityId(), t.getToCityId(),
                    t.getFromStop(), t.getToStop(), t.getDeparture(), t.getArrival(),
                    t.getDurationMin(), t.getDistanceKm(), t.getPriceMru(),
                    t.getSeatsTotal(), t.getSeatsLeft(), t.getBusSize(), t.getStatus()
            );
        }
    }

    public record WalletDto(
            String id, long balanceMru, long points, boolean killSwitch,
            long dailyLimitMru, long perTxLimitMru
    ) {
        public static WalletDto of(Wallet w) {
            return new WalletDto(
                    w.getId().toString(), w.getBalanceMru(), w.getPoints(), w.isKillSwitch(),
                    w.getDailyLimitMru(), w.getPerTxLimitMru()
            );
        }
    }

    public record TransactionDto(
            String id, String type, long amountMru, String status,
            String counterparty, String reference, String note, Instant createdAt
    ) {
        public static TransactionDto of(Transaction t) {
            return new TransactionDto(
                    t.getId().toString(), t.getType(), t.getAmountMru(), t.getStatus(),
                    t.getCounterparty(), t.getReference(), t.getNote(), t.getCreatedAt()
            );
        }
    }

    public record TopupRequest(String source, long amountMru) {}
    public record TransferRequest(String toPhone, long amountMru, String note) {}

    public record CompanyDto(
            String id, String name, String type, String city, String contact, String logoUrl,
            double rating, int fleetSize, String status, Instant createdAt
    ) {
        public static CompanyDto of(Company c) {
            return new CompanyDto(
                    c.getId().toString(), c.getName(), c.getType(), c.getCity(), c.getContact(), c.getLogoUrl(),
                    c.getRating(), c.getFleetSize(), c.getStatus(), c.getCreatedAt()
            );
        }
    }

    public record CreateCompanyRequest(
            String name, String type, String city, String contact, String logoUrl, Integer fleetSize
    ) {}

    public record RentalListingDto(
            String id, String companyId, String companyName, String brand, String model, int year,
            String category, long pricePerDayMru, Long priceWeeklyMru, Long priceMonthlyMru,
            int seats, String transmission, boolean airCon, int minDays, long depositMru,
            int kmIncludedPerDay, int extraKmMru, boolean chauffeurAvailable, Long chauffeurPricePerDayMru,
            String city, String status, int photos, List<String> photoUrls, Instant createdAt
    ) {
        public static RentalListingDto of(RentalListing r, List<String> urls) {
            return new RentalListingDto(
                    r.getId().toString(),
                    r.getCompany() != null ? r.getCompany().getId().toString() : null,
                    r.getCompany() != null ? r.getCompany().getName() : null,
                    r.getBrand(), r.getModel(), r.getYear(), r.getCategory(),
                    r.getPricePerDayMru(), r.getPriceWeeklyMru(), r.getPriceMonthlyMru(),
                    r.getSeats(), r.getTransmission(), r.isAirCon(), r.getMinDays(), r.getDepositMru(),
                    r.getKmIncludedPerDay(), r.getExtraKmMru(), r.isChauffeurAvailable(), r.getChauffeurPricePerDayMru(),
                    r.getCity(), r.getStatus(), r.getPhotos(), urls, r.getCreatedAt()
            );
        }
    }

    public record CreateRentalListingRequest(
            String companyId, String brand, String model, int year, String category,
            long pricePerDayMru, Long priceWeeklyMru, Long priceMonthlyMru,
            int seats, String transmission, boolean airCon, Integer minDays, Long depositMru,
            Integer kmIncludedPerDay, Integer extraKmMru, boolean chauffeurAvailable, Long chauffeurPricePerDayMru,
            String city, List<String> photoUrls
    ) {}

    public record CreateTripRequest(
            String companyId, String fromCityId, String toCityId, String fromStop, String toStop,
            Instant departure, Instant arrival, int durationMin, int distanceKm, long priceMru,
            int seatsTotal, String busSize
    ) {}

    public record CreateListingRequest(
            String brand, String model, int year, Integer importYear, int ownersInCountry,
            long priceMru, int km, String fuel, String transmission, String city, String district,
            String sellerName, String sellerType, boolean kargoVerified, List<String> photoUrls
    ) {}
}
