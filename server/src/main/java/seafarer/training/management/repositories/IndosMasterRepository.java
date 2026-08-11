package seafarer.training.management.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import seafarer.training.management.models.IndosMaster;

@Repository
public interface IndosMasterRepository extends JpaRepository<IndosMaster, UUID> {

    @EntityGraph(attributePaths = {"rank"})
    List<IndosMaster> findAll();

    @EntityGraph(attributePaths = {"rank"})
    Optional<IndosMaster> findById(UUID id);

}
