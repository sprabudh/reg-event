package com.example.eventreg.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Entity
@Table(name = "events")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Event name cannot be empty")
    @Column(nullable = false)
    private String name;

    @NotNull(message = "Event date is required")
    @FutureOrPresent(message = "Event date must be today or in the future")
    @Column(name = "event_date", nullable = false)
    private LocalDate date;

    @NotNull(message = "Capacity is required")
    @Positive(message = "Capacity must be greater than 0")
    @Column(nullable = false)
    private Integer capacity;

    @ManyToOne
    @JoinColumn(name = "category_id")
    @NotNull(message = "Category is required")
    private Category category;

    @Column(name = "location")
    private String location;

    @Column(name = "event_time")
    private String time;

    @Column(name = "duration")
    private String duration;

    @Column(name = "price")
    private Double price;

    @Column(name = "is_online")
    private Boolean isOnline = false;

    @Column(name = "is_refundable")
    private Boolean isRefundable = false;

    private static final Pattern HOURS_PATTERN = Pattern.compile("(\\d+(?:\\.\\d+)?)\\s*(h|hr|hours?)\\b");
    private static final Pattern MINUTES_PATTERN = Pattern.compile("(\\d+(?:\\.\\d+)?)\\s*(m|min|mins|minute|minutes?)\\b");

    public boolean isExpired() {
        if (date == null) return false;

        LocalDateTime start;
        if (time != null && !time.isBlank()) {
            try {
                start = LocalDateTime.of(date, LocalTime.parse(time.trim()));
            } catch (Exception e) {
                start = date.atStartOfDay();
            }
        } else {
            start = date.atStartOfDay();
        }

        long durationMinutes = Math.round(parseDurationHours(duration) * 60);
        LocalDateTime end = start.plusMinutes(durationMinutes);
        return end.isBefore(LocalDateTime.now());
    }

    private double parseDurationHours(String duration) {
        if (duration == null) return 0;
        String s = duration.trim().toLowerCase();
        if (s.isEmpty()) return 0;

        double minutes = 0;
        Matcher hm = HOURS_PATTERN.matcher(s);
        if (hm.find()) minutes += Double.parseDouble(hm.group(1)) * 60;

        Matcher mm = MINUTES_PATTERN.matcher(s);
        if (mm.find()) minutes += Double.parseDouble(mm.group(1));

        if (minutes > 0) return minutes / 60.0;

        try {
            return Double.parseDouble(s);
        } catch (NumberFormatException e) {
            return 0;
        }
    }
}