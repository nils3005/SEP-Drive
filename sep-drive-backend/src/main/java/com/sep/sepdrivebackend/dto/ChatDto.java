package com.sep.sepdrivebackend.dto;

import com.sep.sepdrivebackend.entities.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatDto {
    private Long chatId;
    private Long customerId;
    private Long driverId;
}
