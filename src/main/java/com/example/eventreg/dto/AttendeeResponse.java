package com.example.eventreg.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AttendeeResponse {
    private Long id;
    private String name;
    private String email;
    private LocalDateTime registrationDate;
    private Long eventId;
    private String eventName; // Helpful to show the event name alongside the user
    private String status;
}