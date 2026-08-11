package seafarer.training.management.services;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import seafarer.training.management._exception.ResourceNotFoundException;
import seafarer.training.management.models.RankMaster;
import seafarer.training.management.repositories.RankMasterRepository;

@Service
@RequiredArgsConstructor
public class RankMasterService {

    private final RankMasterRepository rankMasterRepository;

    public List<RankMaster> getAllRanks() {
        return rankMasterRepository.findAll();
    }

    public RankMaster getRankById(UUID id) {
        return rankMasterRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Rank not found"));
    }

}
