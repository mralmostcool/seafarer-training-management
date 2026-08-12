package seafarer.training.management.services;

import java.util.List;
import java.util.UUID;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import seafarer.training.management._exception.ResourceNotFoundException;
import seafarer.training.management.dto.mapper.EnrollmentMapper;
import seafarer.training.management.dto.request.EnrollmentRequestDTO;
import seafarer.training.management.dto.response.EnrollmentResponseDTO;
import seafarer.training.management.models.Enrollment;
import seafarer.training.management.models.EnrollmentStatus;
import seafarer.training.management.models.IndosMaster;
import seafarer.training.management.models.PreSeaCourse;
import seafarer.training.management.repositories.EnrollmentRepository;
import seafarer.training.management.repositories.IndosMasterRepository;
import seafarer.training.management.repositories.PreSeaCourseRepository;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final PreSeaCourseRepository preSeaCourseRepository;
    private final IndosMasterRepository indosMasterRepository;
    private final EnrollmentMapper enrollmentMapper;

    @Cacheable(value = "enrollment", key = "'all'")
    public List<EnrollmentResponseDTO> getAllEnrollments() {
        List<Enrollment> enrollments = enrollmentRepository.findAll();
        return enrollments.stream().map(enrollmentMapper::toResponseDTO).collect(java.util.stream.Collectors.toList());
    }

    public Page<EnrollmentResponseDTO> getRecordsPaginated(
            int page, int size, String sortBy, String sortDir, String search,
            UUID courseId, UUID indosMasterId, EnrollmentStatus status) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        String searchParam = search != null ? search.trim() : "";
        Page<Enrollment> enrollmentsPage = enrollmentRepository.findBySearchAndFilters(
                searchParam, courseId, indosMasterId, status, pageable);
        return enrollmentsPage.map(enrollmentMapper::toResponseDTO);
    }

    @Transactional
    @CacheEvict(value = "enrollment", allEntries = true)
    public EnrollmentResponseDTO saveEnrollment(EnrollmentRequestDTO body) {
        Enrollment enrollment = enrollmentMapper.toEntity(body);
        Enrollment savedEnrollment = enrollmentRepository.save(enrollment);
        return enrollmentMapper.toResponseDTO(savedEnrollment);
    }

    @Cacheable(value = "enrollment", key = "#id")
    public EnrollmentResponseDTO getEnrollmentById(UUID id) {
        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("could not find enrollment with id " + id));
        return enrollmentMapper.toResponseDTO(enrollment);
    }

    @Transactional
    @CacheEvict(value = "enrollment", allEntries = true)
    public EnrollmentResponseDTO updateEnrollmentById(UUID id, EnrollmentRequestDTO body) {
        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("could not find enrollment with id " + id));

        PreSeaCourse preSeaCourse = preSeaCourseRepository.findById(body.getPreSeaCourseId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Pre-sea course not found with ID: " + body.getPreSeaCourseId()));
        IndosMaster indosMaster = indosMasterRepository.findById(body.getIndosMasterId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "INDoS master not found with ID: " + body.getIndosMasterId()));

        enrollment.setPreSeaCourse(preSeaCourse);
        enrollment.setIndosMaster(indosMaster);
        enrollment.setStatus(body.getStatus());
        enrollment.setRemarks(body.getRemarks());

        enrollmentRepository.save(enrollment);
        return enrollmentMapper.toResponseDTO(enrollment);
    }

    @Transactional
    @CacheEvict(value = "enrollment", allEntries = true)
    public void deleteEnrollmentById(UUID id) {
        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("could not find enrollment with id " + id));
        enrollmentRepository.delete(enrollment);
    }

}
