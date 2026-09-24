package com.example.eventreg.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyTicketResponse {
    private Long id;
    private String name;
    private String email;
    private String mobileNumber;
    private LocalDateTime registrationDate;
    private String status;
    private String ticketUuid;
    private String qrCodeBase64;

    private Long eventId;
    private String eventName;
    private LocalDate eventDate;
    private String eventTime;
    private String eventDuration;
    private String eventLocation;
    private Boolean eventIsOnline;
    private Double eventPrice;

    private String invoiceNo;
    private Double amount;
    private String refundStatus;
}