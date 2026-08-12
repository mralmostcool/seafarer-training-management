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
import seafarer.training.management.dto.request.PreSeaCourseRequestDTO;
import seafarer.training.management.dto.response.PreSeaCourseResponseDTO;
import seafarer.training.management.services.PreSeaCourseService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/crud/pre-sea-courses")
public class PreSeaCourseController {

    private final PreSeaCourseService preSeaCourseService;

    @GetMapping
    public ResponseEntity<List<PreSeaCourseResponseDTO>> getAllCourses() {
        List<PreSeaCourseResponseDTO> courses = preSeaCourseService.getAllCourses();
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/page")
    public ResponseEntity<Map<String, Object>> getRecordsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean isActive) {
        Page<PreSeaCourseResponseDTO> paginatedRecords = preSeaCourseService.getRecordsPaginated(
                page, size, sortBy, sortDir, search, isActive);
        
        Map<String, Object> response = new HashMap<>();
        response.put("content", paginatedRecords.getContent());
        response.put("totalPages", paginatedRecords.getTotalPages());
        response.put("totalElements", paginatedRecords.getTotalElements());
        response.put("currentPage", paginatedRecords.getNumber());
        response.put("pageSize", paginatedRecords.getSize());
        
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<PreSeaCourseResponseDTO> createCourse(@RequestBody @Valid PreSeaCourseRequestDTO body) {
        PreSeaCourseResponseDTO course = preSeaCourseService.saveCourse(body);
        return ResponseEntity.status(HttpStatus.CREATED).body(course);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PreSeaCourseResponseDTO> getCourseById(@PathVariable UUID id) {
        PreSeaCourseResponseDTO course = preSeaCourseService.getCourseById(id);
        return ResponseEntity.ok(course);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PreSeaCourseResponseDTO> updateCourseById(
            @PathVariable UUID id,
            @RequestBody @Valid PreSeaCourseRequestDTO body) {
        PreSeaCourseResponseDTO updatedCourse = preSeaCourseService.updateCourseById(id, body);
        return ResponseEntity.ok(updatedCourse);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourseById(@PathVariable UUID id) {
        preSeaCourseService.deleteCourseById(id);
        return ResponseEntity.noContent().build();
    }

}
