package seafarer.training.management.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import seafarer.training.management.models.Enrollment;
import seafarer.training.management.models.EnrollmentStatus;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, UUID> {

    @EntityGraph(attributePaths = {"preSeaCourse", "indosMaster", "indosMaster.rank"})
    List<Enrollment> findAll();

    @EntityGraph(attributePaths = {"preSeaCourse", "indosMaster", "indosMaster.rank"})
    Optional<Enrollment> findById(UUID id);

    @EntityGraph(attributePaths = {"preSeaCourse", "indosMaster", "indosMaster.rank"})
    @Query("SELECT e FROM Enrollment e WHERE " +
           "(:courseId IS NULL OR e.preSeaCourse.id = :courseId) AND " +
           "(:indosMasterId IS NULL OR e.indosMaster.id = :indosMasterId) AND " +
           "(cast(:status as string) IS NULL OR e.status = :status) AND " +
           "(LOWER(e.indosMaster.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(e.indosMaster.indos) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(e.preSeaCourse.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Enrollment> findBySearchAndFilters(
            @Param("search") String search,
            @Param("courseId") UUID courseId,
            @Param("indosMasterId") UUID indosMasterId,
            @Param("status") EnrollmentStatus status,
            Pageable pageable);

}
