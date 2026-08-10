package com.taskflow.modules.calendar.repository;

import com.taskflow.modules.calendar.entity.CalendarEventEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CalendarEventRepository extends JpaRepository<CalendarEventEntity, UUID> {

    @Query("SELECT DISTINCT e FROM CalendarEventEntity e WHERE (e.userId = :userId OR (e.workspaceId IS NOT NULL AND e.workspaceId IN (SELECT wm.workspaceId FROM WorkspaceMemberEntity wm WHERE wm.userId = :userId))) AND e.startTime <= :rangeEnd AND e.endTime >= :rangeStart AND e.isDeleted = false ORDER BY e.startTime ASC")
    List<CalendarEventEntity> findUserEventsInRange(
            @Param("userId") UUID userId,
            @Param("rangeStart") Instant rangeStart,
            @Param("rangeEnd") Instant rangeEnd
    );

    @Query("SELECT e FROM CalendarEventEntity e WHERE e.isDeleted = false AND e.reminderSent = false AND e.startTime >= :now AND e.startTime <= :windowEnd")
    List<CalendarEventEntity> findUpcomingMeetingsToRemind(
            @Param("now") Instant now,
            @Param("windowEnd") Instant windowEnd
    );

    Optional<CalendarEventEntity> findByIdAndIsDeletedFalse(UUID id);
}
