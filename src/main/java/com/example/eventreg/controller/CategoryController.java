package com.example.eventreg.controller;

import com.example.eventreg.entity.Category;
import com.example.eventreg.repository.CategoryRepository;
import com.example.eventreg.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin("*")
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private EventRepository eventRepository;

    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> createCategory(@RequestBody Category category) {
        if (categoryRepository.existsByNameIgnoreCase(category.getName())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Category already exists");
        }
        return new ResponseEntity<>(categoryRepository.save(category), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        // Edge Case: Prevent deletion if events are using this category
        if (eventRepository.countByCategoryId(id) > 0) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Cannot delete: Events are currently using this category.");
        }
        categoryRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}