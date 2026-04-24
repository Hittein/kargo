package com.kargo.api.repository;

import com.kargo.api.model.Conversation;
import com.kargo.api.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {

    List<Message> findByConversationOrderByCreatedAtAsc(Conversation conversation);

    @Modifying
    @Query("""
            update Message m set m.readAt = :readAt
            where m.conversation = :c and m.readAt is null and m.sender.id <> :readerId
            """)
    int markAllRead(
            @Param("c") Conversation c,
            @Param("readerId") UUID readerId,
            @Param("readAt") Instant readAt
    );
}
