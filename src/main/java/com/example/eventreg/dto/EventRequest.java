package com.example.eventreg.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EventRequest {

    @NotBlank(message = "Event name is required")
    private String name;

    @NotNull(message = "Event date is required")
    @FutureOrPresent(message = "Date must be in the present or future")
    private LocalDate date;

    @Min(value = 1, message = "Capacity must be at least 1")
    private int capacity;
}