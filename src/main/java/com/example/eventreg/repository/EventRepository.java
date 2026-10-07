package com.example.eventreg.repository;

import com.example.eventreg.entity.ApprovalStatus;
import com.example.eventreg.entity.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    /**
     * Unfiltered search. Left exactly as it was so admin screens that need to
     * see PENDING/REJECTED rows keep working without change.
     */
    @Query("SELECT e FROM Event e WHERE " +
            "(CAST(:name AS text) IS NULL OR LOWER(e.name) LIKE LOWER(CONCAT('%', CAST(:name AS text), '%'))) AND " +
            "(:categoryId IS NULL OR e.category.id = :categoryId)")
    Page<Event> searchEvents(@Param("name") String name,
                             @Param("categoryId") Long categoryId,
                             Pageable pageable);

    /**
     * Attendee-visible search: same filters as searchEvents, plus approval
     * status.
     *
     * The "IS NULL OR" arm is the important part. Schema comes from
     * ddl-auto=update with no migrations, so every event that existed before
     * this feature has approval_status = NULL. Without that arm the entire
     * existing catalog would silently disappear from the listing.
     */
    @Query("SELECT e FROM Event e WHERE " +
            "(e.approvalStatus IS NULL OR e.approvalStatus = :status) AND " +
            "(CAST(:name AS text) IS NULL OR LOWER(e.name) LIKE LOWER(CONCAT('%', CAST(:name AS text), '%'))) AND " +
            "(:categoryId IS NULL OR e.category.id = :categoryId)")
    Page<Event> searchApprovedEvents(@Param("name") String name,
                                     @Param("categoryId") Long categoryId,
                                     @Param("status") ApprovalStatus status,
                                     Pageable pageable);

    long countByCategoryId(Long categoryId); // Used to prevent category deletion

    /** A host's own submissions, newest first, all approval states. */
    Page<Event> findByHostedByUserIdOrderByIdDesc(Long hostedByUserId, Pageable pageable);

    /** Admin's approval queue. */
    Page<Event> findByApprovalStatusOrderByIdDesc(ApprovalStatus approvalStatus, Pageable pageable);

    long countByApprovalStatus(ApprovalStatus approvalStatus);

    /** Guard so a host can only ever act on their own events. */
    boolean existsByIdAndHostedByUserId(Long id, Long hostedByUserId);
}