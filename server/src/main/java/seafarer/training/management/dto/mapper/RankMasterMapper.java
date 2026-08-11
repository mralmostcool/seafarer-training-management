package seafarer.training.management.dto.mapper;

import org.springframework.stereotype.Component;

import seafarer.training.management.dto.request.RankMasterRequestDTO;
import seafarer.training.management.dto.response.RankMasterResponseDTO;
import seafarer.training.management.models.RankMaster;

@Component
public class RankMasterMapper {

    public RankMasterResponseDTO toResponseDTO(RankMaster rank) {
        return RankMasterResponseDTO.builder()
                .id(rank.getId())
                .name(rank.getName())
                .level(rank.getLevel())
                .createdAt(rank.getCreatedAt())
                .build();
    }

    public RankMaster toEntity(RankMasterRequestDTO dto) {
        return RankMaster.builder()
                .name(dto.getName())
                .level(dto.getLevel())
                .build();
    }
}
