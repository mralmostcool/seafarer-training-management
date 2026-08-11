package seafarer.training.management.services;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import seafarer.training.management._exception.ResourceNotFoundException;
import seafarer.training.management.dto.mapper.IndosMasterMapper;
import seafarer.training.management.dto.request.IndosMasterRequestDTO;
import seafarer.training.management.dto.response.IndosMasterResponseDTO;
import seafarer.training.management.models.IndosMaster;
import seafarer.training.management.models.RankMaster;
import seafarer.training.management.repositories.IndosMasterRepository;
import seafarer.training.management.repositories.RankMasterRepository;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class IndosMasterService {

    private final RankMasterRepository rankMasterRepository;
    private final IndosMasterRepository indosMasterRepository;
    private final IndosMasterMapper indosMasterMapper;

    public List<IndosMasterResponseDTO> getAllRecords() {
        List<IndosMaster> seafarers = indosMasterRepository.findAll();
        return seafarers.stream().map(indos -> indosMasterMapper.toResponseDTO(indos)).toList();
    }

    @Transactional
    public IndosMasterResponseDTO saveIndosMasterRecord(IndosMasterRequestDTO body) {
        IndosMaster seafarer = indosMasterMapper.toEntity(body);
        IndosMaster savedSeafarer = indosMasterRepository.save(seafarer);
        return indosMasterMapper.toResponseDTO(savedSeafarer);
    }

    public IndosMasterResponseDTO getRecordById(UUID id) {
        IndosMaster seafarer = indosMasterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("could not find seafarer with id " + id));
        return indosMasterMapper.toResponseDTO(seafarer);
    }

    @Transactional
    public IndosMasterResponseDTO updateRecordById(UUID id, IndosMasterRequestDTO body) {
        IndosMaster seafarer = indosMasterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("could not find seafarer with id " + id));
        seafarer.setIndos(body.getIndos());
        seafarer.setFirstName(body.getFirstName());
        seafarer.setIsActive(body.getIsActive());

        RankMaster newRank = rankMasterRepository.findById(body.getRankId())
                .orElseThrow(() -> new ResourceNotFoundException("could not find rank with id " + body.getRankId()));
        seafarer.setRank(newRank);

        indosMasterRepository.save(seafarer);
        return indosMasterMapper.toResponseDTO(seafarer);
    }

    @Transactional
    public void deleteRecordById(UUID id) {
        IndosMaster seafarer = indosMasterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("could not find seafarer with id " + id));
        indosMasterRepository.delete(seafarer);
    }

}
