package seafarer.training.management.dto.response;

import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import seafarer.training.management.models.EnrollmentStatus;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EnrollmentResponseDTO {

    private UUID id;
    private PreSeaCourseResponseDTO preSeaCourse;
    private IndosMasterResponseDTO indosMaster;
    private EnrollmentStatus status;
    private String remarks;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

}
