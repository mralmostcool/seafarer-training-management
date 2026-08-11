package seafarer.training.management.controllers.crud;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
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
