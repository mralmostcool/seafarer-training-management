package seafarer.training.management.repositories;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import seafarer.training.management.models.PreSeaCourse;

@Repository
public interface PreSeaCourseRepository extends JpaRepository<PreSeaCourse, UUID> {

    @Query("SELECT p FROM PreSeaCourse p WHERE " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:isActive IS NULL OR p.isActive = :isActive)")
    Page<PreSeaCourse> findBySearchAndFilters(
            @Param("search") String search,
            @Param("isActive") Boolean isActive,
            Pageable pageable);

}
