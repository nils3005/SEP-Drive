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
    @Query("SELECT new com.sep.sepdrivebackend.dto.ChatDto(c.id, c.customer, c.driver) from Chat c where c.customer.username = :username or c.driver.username = :username")
    List<ChatDto> findAllChatsByUsername(@Param("username") String username);

    @Query("SELECT c from Chat c where c.customer.id = :customerId and c.driver.id = :driverId")
    Optional<Chat> findChatByBothUsers(@Param("customerId") Long customerId, @Param("driverId") Long driverId);
}
