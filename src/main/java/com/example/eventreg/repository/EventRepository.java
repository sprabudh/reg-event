package com.example.eventreg.repository;

import com.example.eventreg.entity.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    @Query("SELECT e FROM Event e WHERE " +
            "(CAST(:name AS text) IS NULL OR LOWER(e.name) LIKE LOWER(CONCAT('%', CAST(:name AS text), '%'))) AND " +
            "(:categoryId IS NULL OR e.category.id = :categoryId)")
    Page<Event> searchEvents(@Param("name") String name,
                             @Param("categoryId") Long categoryId,
                             Pageable pageable);

    long countByCategoryId(Long categoryId); // Used to prevent category deletion
}