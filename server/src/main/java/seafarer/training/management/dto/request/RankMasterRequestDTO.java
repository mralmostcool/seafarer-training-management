package seafarer.training.management.dto.request;

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
public class RankMasterRequestDTO {

    @Size(max = 64, message = "Name cannot be longer than 64 characters")
    @NotNull(message = "Name cannot be null")
    private String name;

    @NotNull(message = "Level cannot be null")
    private Integer level;

}
