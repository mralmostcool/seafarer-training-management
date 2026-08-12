package seafarer.training.management.dto.request;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PreSeaCourseRequestDTO {

    @NotBlank(message = "Course name cannot be blank")
    @Size(max = 255, message = "Course name cannot be longer than 255 characters")
    private String name;

    private Boolean isActive;

    @NotNull(message = "Start date cannot be null")
    private LocalDate startDate;

}
