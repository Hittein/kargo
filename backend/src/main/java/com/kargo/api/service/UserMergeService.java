package com.kargo.api.service;

import com.kargo.api.model.Conversation;
import com.kargo.api.model.Listing;
import com.kargo.api.model.ListingView;
import com.kargo.api.model.Message;
import com.kargo.api.model.SavedSearch;
import com.kargo.api.model.Transaction;
import com.kargo.api.model.User;
import com.kargo.api.model.UserActivity;
import com.kargo.api.model.Wallet;
import com.kargo.api.repository.ConversationRepository;
import com.kargo.api.repository.ListingRepository;
import com.kargo.api.repository.ListingViewRepository;
import com.kargo.api.repository.MessageRepository;
import com.kargo.api.repository.SavedSearchRepository;
import com.kargo.api.repository.TransactionRepository;
import com.kargo.api.repository.UserActivityRepository;
import com.kargo.api.repository.UserRepository;
import com.kargo.api.repository.WalletRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Fusionne deux comptes user : toutes les FK pointant vers `secondary` sont
 * ré-assignées à `primary`, les wallets sont additionnés, puis `secondary`
 * est supprimé. Utilisé pour corriger les doublons causés par des variations
 * de saisie du numéro (fixées en amont via PhoneUtil.normalize).
 */
@Service
public class UserMergeService {

    private final UserRepository users;
    private final ListingRepository listings;
    private final ListingViewRepository listingViews;
    private final SavedSearchRepository savedSearches;
    private final TransactionRepository transactions;
    private final UserActivityRepository activities;
    private final ConversationRepository conversations;
    private final MessageRepository messages;
    private final WalletRepository wallets;

    public UserMergeService(
            UserRepository users,
            ListingRepository listings,
            ListingViewRepository listingViews,
            SavedSearchRepository savedSearches,
            TransactionRepository transactions,
            UserActivityRepository activities,
            ConversationRepository conversations,
            MessageRepository messages,
            WalletRepository wallets
    ) {
        this.users = users;
        this.listings = listings;
        this.listingViews = listingViews;
        this.savedSearches = savedSearches;
        this.transactions = transactions;
        this.activities = activities;
        this.conversations = conversations;
        this.messages = messages;
        this.wallets = wallets;
    }

    @Transactional
    public MergeResult merge(User primary, User secondary) {
        if (primary.getId().equals(secondary.getId())) {
            return new MergeResult(0, 0, 0, 0, 0, 0);
        }

        int listingCount = 0;
        for (Listing l : listings.findBySellerOrderByPublishedAtDesc(secondary)) {
            l.setSeller(primary);
            listings.save(l);
            listingCount++;
        }

        int viewCount = 0;
        for (ListingView v : listingViews.findByViewerOrderByViewedAtDesc(secondary)) {
            v.setViewer(primary);
            listingViews.save(v);
            viewCount++;
        }

        int savedCount = 0;
        for (SavedSearch s : savedSearches.findByUserOrderByCreatedAtDesc(secondary)) {
            s.setUser(primary);
            savedSearches.save(s);
            savedCount++;
        }

        int txCount = 0;
        for (Transaction t : transactions.findByUserOrderByCreatedAtDesc(secondary)) {
            t.setUser(primary);
            transactions.save(t);
            txCount++;
        }

        int activityCount = 0;
        for (UserActivity a : activities.findByUserOrderByCreatedAtDesc(
                secondary, org.springframework.data.domain.Pageable.unpaged())) {
            a.setUser(primary);
            activities.save(a);
            activityCount++;
        }

        int convCount = 0;
        for (Conversation c : conversations.findForUserOrderByLastDesc(secondary)) {
            if (secondary.equals(c.getParticipantA())) c.setParticipantA(primary);
            if (secondary.equals(c.getParticipantB())) c.setParticipantB(primary);
            conversations.save(c);
            convCount++;
        }

        // Messages : via conversations déjà ré-attachées, mais le sender peut aussi
        // pointer vers secondary dans des conversations dont un autre user est
        // l'interlocuteur. On balaie toutes les conversations du primary.
        for (Conversation c : conversations.findForUserOrderByLastDesc(primary)) {
            List<Message> msgs = messages.findByConversationOrderByCreatedAtAsc(c);
            for (Message m : msgs) {
                if (secondary.equals(m.getSender())) {
                    m.setSender(primary);
                    messages.save(m);
                }
            }
        }

        // Wallets : additionne les soldes, garde le wallet du primary.
        Wallet wp = wallets.findByUser(primary).orElse(null);
        Wallet ws = wallets.findByUser(secondary).orElse(null);
        if (ws != null) {
            if (wp != null) {
                wp.setBalanceMru(wp.getBalanceMru() + ws.getBalanceMru());
                wp.setPoints(wp.getPoints() + ws.getPoints());
                wallets.save(wp);
            } else {
                ws.setUser(primary);
                wallets.save(ws);
            }
            if (wp != null) wallets.delete(ws);
        }

        users.delete(secondary);

        return new MergeResult(listingCount, viewCount, savedCount, txCount,
                activityCount, convCount);
    }

    public record MergeResult(
            int listings,
            int listingViews,
            int savedSearches,
            int transactions,
            int activities,
            int conversations
    ) {}
}
