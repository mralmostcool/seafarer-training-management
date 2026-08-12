package seafarer.training.management.dto.request;

import java.util.UUID;

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
public class IndosMasterRequestDTO {

    @NotBlank(message = "INDoS field cannot be blank")
    @Size(max = 7, message = "INDoS field cannot be longer than 7 characters")
    private String indos;

    @NotBlank(message = "First name cannot be blank")
    @Size(max = 255, message = "First name cannot be longer than 255 characters")
    private String firstName;

    @NotNull(message = "Rank ID cannot be null")
    private UUID rankId;

    private Boolean isActive;

}
