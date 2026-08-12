package seafarer.training.management.services;

import java.util.List;
import java.util.UUID;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import seafarer.training.management._exception.ResourceNotFoundException;
import seafarer.training.management.models.RankMaster;
import seafarer.training.management.repositories.RankMasterRepository;

@Service
@RequiredArgsConstructor
public class RankMasterService {

    private final RankMasterRepository rankMasterRepository;

    @Cacheable(value = "ranks", key = "'all'")
    public List<RankMaster> getAllRanks() {
        return rankMasterRepository.findAll();
    }

    @Cacheable(value = "ranks", key = "#id")
    public RankMaster getRankById(UUID id) {
        return rankMasterRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Rank not found"));
    }

}
