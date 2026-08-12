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

import seafarer.training.management.models.IndosMaster;

@Repository
public interface IndosMasterRepository extends JpaRepository<IndosMaster, UUID> {

    @EntityGraph(attributePaths = {"rank"})
    List<IndosMaster> findAll();

    @EntityGraph(attributePaths = {"rank"})
    Optional<IndosMaster> findById(UUID id);

    @EntityGraph(attributePaths = {"rank"})
    @Query("SELECT i FROM IndosMaster i WHERE " +
           "(LOWER(i.indos) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(i.firstName) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:rankId IS NULL OR i.rank.id = :rankId) " +
           "AND (:isActive IS NULL OR i.isActive = :isActive)")
    Page<IndosMaster> findBySearchAndFilters(
            @Param("search") String search,
            @Param("rankId") UUID rankId,
            @Param("isActive") Boolean isActive,
            Pageable pageable);

}
