package com.example.eventreg.dto;

import com.example.eventreg.entity.Category;
import com.example.eventreg.entity.Event;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EventCreationResponse {
    private Long id;
    private Category category;
    private String message;

    public static EventCreationResponse from(Event event, String message) {
        return new EventCreationResponse(event.getId(), event.getCategory(), message);
    }
}
