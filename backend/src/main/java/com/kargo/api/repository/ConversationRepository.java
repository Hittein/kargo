package com.kargo.api.repository;

import com.kargo.api.model.Conversation;
import com.kargo.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConversationRepository extends JpaRepository<Conversation, UUID> {

    @Query("""
            select c from Conversation c
            where c.participantA = :user or c.participantB = :user
            order by c.lastMessageAt desc
            """)
    List<Conversation> findForUserOrderByLastDesc(@Param("user") User user);

    /** Trouve une conversation listing entre 2 utilisateurs (participants ordonnés). */
    @Query("""
            select c from Conversation c
            where c.kind = 'LISTING' and c.listingId = :listingId
              and ((c.participantA = :a and c.participantB = :b)
                or (c.participantA = :b and c.participantB = :a))
            """)
    Optional<Conversation> findListingConversation(
            @Param("listingId") UUID listingId,
            @Param("a") User a,
            @Param("b") User b
    );

    @Query("""
            select c from Conversation c
            where c.kind = 'SUPPORT' and c.participantA = :user and c.participantB is null
            """)
    Optional<Conversation> findSupportConversation(@Param("user") User user);
}
