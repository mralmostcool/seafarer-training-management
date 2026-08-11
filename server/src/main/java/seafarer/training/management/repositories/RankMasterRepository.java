package seafarer.training.management.repositories;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import seafarer.training.management.models.RankMaster;

@Repository
public interface RankMasterRepository extends JpaRepository<RankMaster, UUID> {

}
