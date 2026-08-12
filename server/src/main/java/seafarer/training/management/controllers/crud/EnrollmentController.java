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
import seafarer.training.management.dto.request.EnrollmentRequestDTO;
import seafarer.training.management.dto.response.EnrollmentResponseDTO;
import seafarer.training.management.models.EnrollmentStatus;
import seafarer.training.management.services.EnrollmentService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/crud/enrollments")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @GetMapping
    public ResponseEntity<List<EnrollmentResponseDTO>> getAllEnrollments() {
        List<EnrollmentResponseDTO> enrollments = enrollmentService.getAllEnrollments();
        return ResponseEntity.ok(enrollments);
    }

    @GetMapping("/page")
    public ResponseEntity<Map<String, Object>> getRecordsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID courseId,
            @RequestParam(required = false) UUID indosMasterId,
            @RequestParam(required = false) EnrollmentStatus status) {
        Page<EnrollmentResponseDTO> paginatedRecords = enrollmentService.getRecordsPaginated(
                page, size, sortBy, sortDir, search, courseId, indosMasterId, status);
        
        Map<String, Object> response = new HashMap<>();
        response.put("content", paginatedRecords.getContent());
        response.put("totalPages", paginatedRecords.getTotalPages());
        response.put("totalElements", paginatedRecords.getTotalElements());
        response.put("currentPage", paginatedRecords.getNumber());
        response.put("pageSize", paginatedRecords.getSize());
        
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<EnrollmentResponseDTO> createEnrollment(@RequestBody @Valid EnrollmentRequestDTO body) {
        EnrollmentResponseDTO enrollment = enrollmentService.saveEnrollment(body);
        return ResponseEntity.status(HttpStatus.CREATED).body(enrollment);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EnrollmentResponseDTO> getEnrollmentById(@PathVariable UUID id) {
        EnrollmentResponseDTO enrollment = enrollmentService.getEnrollmentById(id);
        return ResponseEntity.ok(enrollment);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EnrollmentResponseDTO> updateEnrollmentById(
            @PathVariable UUID id,
            @RequestBody @Valid EnrollmentRequestDTO body) {
        EnrollmentResponseDTO updatedEnrollment = enrollmentService.updateEnrollmentById(id, body);
        return ResponseEntity.ok(updatedEnrollment);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEnrollmentById(@PathVariable UUID id) {
        enrollmentService.deleteEnrollmentById(id);
        return ResponseEntity.noContent().build();
    }

}
