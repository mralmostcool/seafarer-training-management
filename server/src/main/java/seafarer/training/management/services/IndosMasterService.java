package seafarer.training.management.services;

import java.util.List;
import java.util.UUID;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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

    @Cacheable(value = "indos", key = "'all'")
    public List<IndosMasterResponseDTO> getAllRecords() {
        List<IndosMaster> seafarers = indosMasterRepository.findAll();
        return seafarers.stream().map(indos -> indosMasterMapper.toResponseDTO(indos)).collect(java.util.stream.Collectors.toList());
    }

    public Page<IndosMasterResponseDTO> getRecordsPaginated(int page, int size, String sortBy, String sortDir,
            String search, UUID rankId, Boolean isActive) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        String searchParam = search != null ? search.trim() : "";
        Page<IndosMaster> seafarersPage = indosMasterRepository.findBySearchAndFilters(searchParam, rankId, isActive,
                pageable);
        return seafarersPage.map(indosMasterMapper::toResponseDTO);
    }

    @Transactional
    @CacheEvict(value = "indos", allEntries = true)
    public IndosMasterResponseDTO saveIndosMasterRecord(IndosMasterRequestDTO body) {
        IndosMaster seafarer = indosMasterMapper.toEntity(body);
        IndosMaster savedSeafarer = indosMasterRepository.save(seafarer);
        return indosMasterMapper.toResponseDTO(savedSeafarer);
    }

    @Cacheable(value = "indos", key = "#id")
    public IndosMasterResponseDTO getRecordById(UUID id) {
        IndosMaster seafarer = indosMasterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("could not find seafarer with id " + id));
        return indosMasterMapper.toResponseDTO(seafarer);
    }

    @Transactional
    @CacheEvict(value = "indos", allEntries = true)
    public IndosMasterResponseDTO updateRecordById(UUID id, IndosMasterRequestDTO body) {
        IndosMaster seafarer = indosMasterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("could not find seafarer with id " + id));
        seafarer.setIndos(body.getIndos());
        seafarer.setFirstName(body.getFirstName());
        seafarer.setIsActive(body.getIsActive() != null ? body.getIsActive() : seafarer.getIsActive());

        RankMaster newRank = rankMasterRepository.findById(body.getRankId())
                .orElseThrow(() -> new ResourceNotFoundException("could not find rank with id " + body.getRankId()));
        seafarer.setRank(newRank);

        indosMasterRepository.save(seafarer);
        return indosMasterMapper.toResponseDTO(seafarer);
    }

    @Transactional
    @CacheEvict(value = "indos", allEntries = true)
    public void deleteRecordById(UUID id) {
        IndosMaster seafarer = indosMasterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("could not find seafarer with id " + id));
        indosMasterRepository.delete(seafarer);
    }

}
