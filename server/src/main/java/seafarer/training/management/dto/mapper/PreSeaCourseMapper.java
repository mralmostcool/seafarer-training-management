package seafarer.training.management.dto.mapper;

import org.springframework.stereotype.Component;

import seafarer.training.management.dto.request.PreSeaCourseRequestDTO;
import seafarer.training.management.dto.response.PreSeaCourseResponseDTO;
import seafarer.training.management.models.PreSeaCourse;

@Component
public class PreSeaCourseMapper {

    public PreSeaCourseResponseDTO toResponseDTO(PreSeaCourse entity) {
        return PreSeaCourseResponseDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .isActive(entity.getIsActive())
                .startDate(entity.getStartDate())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public PreSeaCourse toEntity(PreSeaCourseRequestDTO dto) {
        return PreSeaCourse.builder()
                .name(dto.getName())
                .isActive(dto.getIsActive())
                .startDate(dto.getStartDate())
                .build();
    }

}
