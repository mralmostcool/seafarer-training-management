package seafarer.training.management.models;

import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "indos_master")
public class IndosMaster {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Size(max = 7)
    @Column(name = "indos", nullable = false, unique = true)
    private String indos;

    @Size(max = 255)
    @Column(name = "first_name", nullable = false)
    private String firstName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rank_id", nullable = false)
    private RankMaster rank;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = OffsetDateTime.now();
        this.updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }

    // --------- derived / convenience methods ---------
    @Transient
    public Integer getRankLevel() {
        return rank == null ? null : rank.getLevel();
    }

    @Transient
    public UUID getRankId() {
        return rank == null ? null : rank.getId();
    }

}
