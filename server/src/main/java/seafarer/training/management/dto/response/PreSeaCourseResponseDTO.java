package seafarer.training.management.dto.response;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PreSeaCourseResponseDTO {

    private UUID id;
    private String name;
    private Boolean isActive;
    private LocalDate startDate;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

}
