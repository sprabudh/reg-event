package com.example.eventreg.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EventResponse {
    private Long id;
    private String name;
    private LocalDate date;
    private int capacity;
}