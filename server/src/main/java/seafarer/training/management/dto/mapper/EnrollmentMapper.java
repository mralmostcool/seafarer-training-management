package seafarer.training.management.dto.mapper;

import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import seafarer.training.management._exception.ResourceNotFoundException;
import seafarer.training.management.dto.request.EnrollmentRequestDTO;
import seafarer.training.management.dto.response.EnrollmentResponseDTO;
import seafarer.training.management.models.Enrollment;
import seafarer.training.management.models.EnrollmentStatus;
import seafarer.training.management.models.IndosMaster;
import seafarer.training.management.models.PreSeaCourse;
import seafarer.training.management.repositories.IndosMasterRepository;
import seafarer.training.management.repositories.PreSeaCourseRepository;

@Component
@RequiredArgsConstructor
public class EnrollmentMapper {

    private final PreSeaCourseRepository preSeaCourseRepository;
    private final IndosMasterRepository indosMasterRepository;
    private final PreSeaCourseMapper preSeaCourseMapper;
    private final IndosMasterMapper indosMasterMapper;

    public EnrollmentResponseDTO toResponseDTO(Enrollment entity) {
        return EnrollmentResponseDTO.builder()
                .id(entity.getId())
                .preSeaCourse(preSeaCourseMapper.toResponseDTO(entity.getPreSeaCourse()))
                .indosMaster(indosMasterMapper.toResponseDTO(entity.getIndosMaster()))
                .status(entity.getStatus())
                .remarks(entity.getRemarks())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public Enrollment toEntity(EnrollmentRequestDTO dto) {
        PreSeaCourse preSeaCourse = preSeaCourseRepository.findById(dto.getPreSeaCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Pre-sea course not found with ID: " + dto.getPreSeaCourseId()));
        IndosMaster indosMaster = indosMasterRepository.findById(dto.getIndosMasterId())
                .orElseThrow(() -> new ResourceNotFoundException("INDoS master not found with ID: " + dto.getIndosMasterId()));

        return Enrollment.builder()
                .preSeaCourse(preSeaCourse)
                .indosMaster(indosMaster)
                .status(dto.getStatus() != null ? dto.getStatus() : EnrollmentStatus.ENROLLED)
                .remarks(dto.getRemarks())
                .build();
    }

}
