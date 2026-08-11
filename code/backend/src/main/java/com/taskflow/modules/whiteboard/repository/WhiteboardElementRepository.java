package com.taskflow.modules.whiteboard.repository;

import com.taskflow.modules.whiteboard.entity.WhiteboardElementEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WhiteboardElementRepository extends JpaRepository<WhiteboardElementEntity, UUID> {

    @Query("SELECT e FROM WhiteboardElementEntity e WHERE e.whiteboardId = :whiteboardId ORDER BY e.zIndex ASC")
    List<WhiteboardElementEntity> findByWhiteboardIdOrderByZIndexAsc(@Param("whiteboardId") UUID whiteboardId);

    @Modifying
    @Query("DELETE FROM WhiteboardElementEntity e WHERE e.whiteboardId = :whiteboardId")
    void deleteByWhiteboardId(@Param("whiteboardId") UUID whiteboardId);
}
