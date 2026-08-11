package seafarer.training.management.dto.mapper;

import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import seafarer.training.management._exception.ResourceNotFoundException;
import seafarer.training.management.dto.request.IndosMasterRequestDTO;
import seafarer.training.management.dto.response.IndosMasterResponseDTO;
import seafarer.training.management.dto.response.RankMasterResponseDTO;
import seafarer.training.management.models.IndosMaster;
import seafarer.training.management.models.RankMaster;
import seafarer.training.management.repositories.RankMasterRepository;

@Component
@RequiredArgsConstructor
public class IndosMasterMapper {

    private final RankMasterRepository rankMasterRepository;

    public IndosMasterResponseDTO toResponseDTO(IndosMaster entity) {
        return IndosMasterResponseDTO.builder()
                .id(entity.getId())
                .indos(entity.getIndos())
                .firstName(entity.getFirstName())
                .rank(
                        RankMasterResponseDTO.builder()
                                .id(entity.getRank().getId())
                                .name(entity.getRank().getName())
                                .level(entity.getRank().getLevel())
                                .build())
                .isActive(entity.getIsActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public IndosMaster toEntity(IndosMasterRequestDTO dto) {
        RankMaster rank = rankMasterRepository.findById(dto.getRankId())
                .orElseThrow(() -> new ResourceNotFoundException("The rank of the indos master is missing!"));
        return IndosMaster.builder()
                .indos(dto.getIndos())
                .firstName(dto.getFirstName())
                .rank(rank)
                .isActive(dto.getIsActive())
                .build();
    }

}
