package seafarer.training.management.controllers.crud;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
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

}
