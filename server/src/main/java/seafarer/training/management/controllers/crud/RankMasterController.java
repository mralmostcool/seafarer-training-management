package seafarer.training.management.controllers.crud;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import seafarer.training.management.dto.mapper.RankMasterMapper;
import seafarer.training.management.dto.response.RankMasterResponseDTO;
import seafarer.training.management.models.RankMaster;
import seafarer.training.management.services.RankMasterService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/crud/rank-master")
public class RankMasterController {

    private final RankMasterService rankMasterService;
    private final RankMasterMapper rankMasterMapper;

    @GetMapping
    public ResponseEntity<List<RankMasterResponseDTO>> getAllRanks() {
        List<RankMaster> ranks = rankMasterService.getAllRanks();
        return ResponseEntity.ok(ranks.stream().map(rankMasterMapper::toResponseDTO).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RankMasterResponseDTO> getRankById(@PathVariable UUID id) {
        RankMaster rank = rankMasterService.getRankById(id);
        return ResponseEntity.ok(rankMasterMapper.toResponseDTO(rank));
    }

}
