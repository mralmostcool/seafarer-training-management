package seafarer.training.management.controllers.crud;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import seafarer.training.management.dto.request.IndosMasterRequestDTO;
import seafarer.training.management.dto.response.IndosMasterResponseDTO;
import seafarer.training.management.services.IndosMasterService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/crud/indos-master")
public class IndosMasterController {

    private final IndosMasterService indosMasterService;

    @GetMapping
    public ResponseEntity<List<IndosMasterResponseDTO>> getAllRecords() {
        List<IndosMasterResponseDTO> indosMaster = indosMasterService.getAllRecords();
        return ResponseEntity.ok(indosMaster);
    }

    @GetMapping("/page")
    public ResponseEntity<Map<String, Object>> getRecordsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID rankId,
            @RequestParam(required = false) Boolean isActive) {
        Page<IndosMasterResponseDTO> paginatedRecords = indosMasterService.getRecordsPaginated(
                page, size, sortBy, sortDir, search, rankId, isActive);

        Map<String, Object> response = new HashMap<>();
        response.put("content", paginatedRecords.getContent());
        response.put("totalPages", paginatedRecords.getTotalPages());
        response.put("totalElements", paginatedRecords.getTotalElements());
        response.put("currentPage", paginatedRecords.getNumber());
        response.put("pageSize", paginatedRecords.getSize());

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<IndosMasterResponseDTO> createSeafarerRecord(@RequestBody @Valid IndosMasterRequestDTO body) {
        IndosMasterResponseDTO seafarer = indosMasterService.saveIndosMasterRecord(body);
        return ResponseEntity.status(HttpStatus.CREATED).body(seafarer);
    }

    @GetMapping("/{id}")
    public ResponseEntity<IndosMasterResponseDTO> getRecordById(@PathVariable UUID id) {
        IndosMasterResponseDTO seafarer = indosMasterService.getRecordById(id);
        return ResponseEntity.ok(seafarer);
    }

    @PutMapping("/{id}")
    public ResponseEntity<IndosMasterResponseDTO> updateRecordById(
            @PathVariable UUID id,
            @RequestBody @Valid IndosMasterRequestDTO body) {
        IndosMasterResponseDTO updatedSeafarer = indosMasterService.updateRecordById(id, body);
        return ResponseEntity.ok(updatedSeafarer);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecordById(@PathVariable UUID id) {
        indosMasterService.deleteRecordById(id);
        return ResponseEntity.noContent().build();
    }

}
