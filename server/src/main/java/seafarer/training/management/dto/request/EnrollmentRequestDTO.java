package seafarer.training.management.dto.request;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import seafarer.training.management.models.EnrollmentStatus;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnrollmentRequestDTO {

    @NotNull(message = "Pre-sea course ID cannot be null")
    private UUID preSeaCourseId;

    @NotNull(message = "INDoS master ID cannot be null")
    private UUID indosMasterId;

    @NotNull(message = "Status cannot be null")
    private EnrollmentStatus status;

    private String remarks;

}
