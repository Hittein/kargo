package com.kargo.api.controller;

import com.kargo.api.dto.Dtos.ConversationDto;
import com.kargo.api.dto.Dtos.MessageDto;
import com.kargo.api.dto.Dtos.SendMessageRequest;
import com.kargo.api.dto.Dtos.StartConversationRequest;
import com.kargo.api.model.Conversation;
import com.kargo.api.model.Listing;
import com.kargo.api.model.Message;
import com.kargo.api.model.User;
import com.kargo.api.repository.ConversationRepository;
import com.kargo.api.repository.ListingRepository;
import com.kargo.api.repository.MessageRepository;
import com.kargo.api.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/conversations")
public class ConversationController {

    private final ConversationRepository conversations;
    private final MessageRepository messages;
    private final ListingRepository listings;
    private final UserRepository users;

    public ConversationController(
            ConversationRepository conversations,
            MessageRepository messages,
            ListingRepository listings,
            UserRepository users
    ) {
        this.conversations = conversations;
        this.messages = messages;
        this.listings = listings;
        this.users = users;
    }

    @GetMapping
    public ResponseEntity<List<ConversationDto>> list(@AuthenticationPrincipal User principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        String myId = principal.getId().toString();
        List<ConversationDto> out = conversations.findForUserOrderByLastDesc(principal)
                .stream()
                .map(c -> ConversationDto.of(c, myId))
                .toList();
        return ResponseEntity.ok(out);
    }

    /** Crée ou retourne la conversation existante (idempotent). */
    @PostMapping
    @Transactional
    public ResponseEntity<?> start(
            @AuthenticationPrincipal User principal,
            @RequestBody StartConversationRequest body
    ) {
        if (principal == null) return ResponseEntity.status(401).build();
        String kind = body.kind() == null ? "LISTING" : body.kind().toUpperCase();
        String myId = principal.getId().toString();

        if ("SUPPORT".equals(kind)) {
            Conversation c = conversations.findSupportConversation(principal)
                    .orElseGet(() -> {
                        Conversation n = Conversation.builder()
                                .participantA(principal)
                                .kind("SUPPORT")
                                .lastMessagePreview("")
                                .build();
                        return conversations.save(n);
                    });
            return ResponseEntity.ok(ConversationDto.of(c, myId));
        }

        if ("LISTING".equals(kind)) {
            if (body.listingId() == null) {
                return ResponseEntity.badRequest().body("listingId_required");
            }
            UUID listingUuid;
            try {
                listingUuid = UUID.fromString(body.listingId());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body("listingId_invalid");
            }
            Optional<Listing> maybeListing = listings.findById(listingUuid);
            if (maybeListing.isEmpty()) return ResponseEntity.status(404).body("listing_not_found");
            Listing listing = maybeListing.get();
            User seller = listing.getSeller();
            if (seller == null) {
                // Fallback: si le listing n'a pas de seller attaché (legacy), on ne peut pas
                // initier une conversation. L'UX tombera sur le support.
                return ResponseEntity.status(409).body("listing_has_no_seller");
            }
            if (seller.getId().equals(principal.getId())) {
                return ResponseEntity.status(409).body("cannot_message_self");
            }
            Conversation c = conversations.findListingConversation(listingUuid, principal, seller)
                    .orElseGet(() -> {
                        Conversation n = Conversation.builder()
                                .participantA(principal)
                                .participantB(seller)
                                .kind("LISTING")
                                .listingId(listingUuid)
                                .lastMessagePreview("")
                                .build();
                        return conversations.save(n);
                    });
            return ResponseEntity.ok(ConversationDto.of(c, myId));
        }

        return ResponseEntity.badRequest().body("unsupported_kind");
    }

    @GetMapping("/{id}/messages")
    public ResponseEntity<List<MessageDto>> listMessages(
            @AuthenticationPrincipal User principal,
            @PathVariable UUID id
    ) {
        if (principal == null) return ResponseEntity.status(401).build();
        var maybe = conversations.findById(id).filter(c -> isParticipant(c, principal));
        if (maybe.isEmpty()) return ResponseEntity.status(404).build();
        String myId = principal.getId().toString();
        List<MessageDto> out = messages.findByConversationOrderByCreatedAtAsc(maybe.get())
                .stream()
                .map(m -> MessageDto.of(m, myId))
                .toList();
        return ResponseEntity.ok(out);
    }

    @PostMapping("/{id}/messages")
    @Transactional
    public ResponseEntity<?> sendMessage(
            @AuthenticationPrincipal User principal,
            @PathVariable UUID id,
            @RequestBody SendMessageRequest body
    ) {
        if (principal == null) return ResponseEntity.status(401).build();
        if (body.text() == null || body.text().isBlank()) {
            return ResponseEntity.badRequest().body("text_required");
        }
        var maybe = conversations.findById(id).filter(c -> isParticipant(c, principal));
        if (maybe.isEmpty()) return ResponseEntity.status(404).build();
        Conversation c = maybe.get();
        Instant now = Instant.now();
        String text = body.text().trim();

        Message m = Message.builder()
                .conversation(c)
                .sender(principal)
                .text(text)
                .createdAt(now)
                .build();
        messages.save(m);

        // Update conversation metadata.
        c.setLastMessagePreview(text.length() > 200 ? text.substring(0, 200) : text);
        c.setLastMessageAt(now);
        boolean senderIsA = c.getParticipantA() != null
                && c.getParticipantA().getId().equals(principal.getId());
        if (senderIsA) {
            c.setUnreadForB(c.getUnreadForB() + 1);
        } else {
            c.setUnreadForA(c.getUnreadForA() + 1);
        }
        conversations.save(c);

        return ResponseEntity.ok(MessageDto.of(m, principal.getId().toString()));
    }

    @PostMapping("/{id}/read")
    @Transactional
    public ResponseEntity<ConversationDto> markRead(
            @AuthenticationPrincipal User principal,
            @PathVariable UUID id
    ) {
        if (principal == null) return ResponseEntity.status(401).build();
        var maybe = conversations.findById(id).filter(c -> isParticipant(c, principal));
        if (maybe.isEmpty()) return ResponseEntity.status(404).build();
        Conversation c = maybe.get();
        messages.markAllRead(c, principal.getId(), Instant.now());
        boolean iAmA = c.getParticipantA() != null
                && c.getParticipantA().getId().equals(principal.getId());
        if (iAmA) c.setUnreadForA(0); else c.setUnreadForB(0);
        conversations.save(c);
        return ResponseEntity.ok(ConversationDto.of(c, principal.getId().toString()));
    }

    private static boolean isParticipant(Conversation c, User user) {
        if (c.getParticipantA() != null && c.getParticipantA().getId().equals(user.getId())) return true;
        if (c.getParticipantB() != null && c.getParticipantB().getId().equals(user.getId())) return true;
        return false;
    }
}
