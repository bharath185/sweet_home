package com.eteks.sweethome3d.spring.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "plan_revisions")
public class PlanRevisionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "plan_id", nullable = false, length = 64)
    private String planId;

    @Column(name = "revision_number", nullable = false)
    private Long revisionNumber;

    @Column(name = "snapshot_json", columnDefinition = "TEXT", nullable = false)
    private String snapshotJson;

    @Column(name = "author_name", length = 255)
    private String authorName;

    @Column(name = "change_description", length = 512)
    private String changeDescription;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public PlanRevisionEntity() {}

    public PlanRevisionEntity(String planId, Long revisionNumber, String snapshotJson, String authorName, String changeDescription) {
        this.planId = planId;
        this.revisionNumber = revisionNumber;
        this.snapshotJson = snapshotJson;
        this.authorName = authorName;
        this.changeDescription = changeDescription;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPlanId() { return planId; }
    public void setPlanId(String planId) { this.planId = planId; }

    public Long getRevisionNumber() { return revisionNumber; }
    public void setRevisionNumber(Long revisionNumber) { this.revisionNumber = revisionNumber; }

    public String getSnapshotJson() { return snapshotJson; }
    public void setSnapshotJson(String snapshotJson) { this.snapshotJson = snapshotJson; }

    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }

    public String getChangeDescription() { return changeDescription; }
    public void setChangeDescription(String changeDescription) { this.changeDescription = changeDescription; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
