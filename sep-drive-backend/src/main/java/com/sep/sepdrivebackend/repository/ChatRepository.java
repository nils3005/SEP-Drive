package com.sep.sepdrivebackend.repository;

import com.sep.sepdrivebackend.dto.ChatDto;
import com.sep.sepdrivebackend.entities.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {
    @Query("SELECT new com.sep.sepdrivebackend.dto.ChatDto(c.id, c.user1, c.user2) from Chat c where c.user1.username = :username or c.user2.username = :username")
    List<ChatDto> findAllChatsByUsername(@Param("username") String username);

    @Query("SELECT c from Chat c where (c.user1.username = :user1 and c.user2.username = :user2) or (c.user2.username = :user1 and c.user1.username = :user2)")
    Optional<Chat> findChatByBothUsers(@Param("user1") String user1, @Param("user2") String user2);
}
