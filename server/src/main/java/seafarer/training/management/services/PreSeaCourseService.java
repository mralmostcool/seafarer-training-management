package seafarer.training.management.services;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import seafarer.training.management._exception.ResourceNotFoundException;
import seafarer.training.management.dto.mapper.PreSeaCourseMapper;
import seafarer.training.management.dto.request.PreSeaCourseRequestDTO;
import seafarer.training.management.dto.response.PreSeaCourseResponseDTO;
import seafarer.training.management.models.PreSeaCourse;
import seafarer.training.management.repositories.PreSeaCourseRepository;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PreSeaCourseService {

    private final PreSeaCourseRepository preSeaCourseRepository;
    private final PreSeaCourseMapper preSeaCourseMapper;

    public List<PreSeaCourseResponseDTO> getAllCourses() {
        List<PreSeaCourse> courses = preSeaCourseRepository.findAll();
        return courses.stream().map(preSeaCourseMapper::toResponseDTO).toList();
    }

    @Transactional
    public PreSeaCourseResponseDTO saveCourse(PreSeaCourseRequestDTO body) {
        PreSeaCourse course = preSeaCourseMapper.toEntity(body);
        PreSeaCourse savedCourse = preSeaCourseRepository.save(course);
        return preSeaCourseMapper.toResponseDTO(savedCourse);
    }

    public PreSeaCourseResponseDTO getCourseById(UUID id) {
        PreSeaCourse course = preSeaCourseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("could not find course with id " + id));
        return preSeaCourseMapper.toResponseDTO(course);
    }

    @Transactional
    public PreSeaCourseResponseDTO updateCourseById(UUID id, PreSeaCourseRequestDTO body) {
        PreSeaCourse course = preSeaCourseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("could not find course with id " + id));
        course.setName(body.getName());
        course.setIsActive(body.getIsActive());
        course.setStartDate(body.getStartDate());

        preSeaCourseRepository.save(course);
        return preSeaCourseMapper.toResponseDTO(course);
    }

    @Transactional
    public void deleteCourseById(UUID id) {
        PreSeaCourse course = preSeaCourseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("could not find course with id " + id));
        preSeaCourseRepository.delete(course);
    }

}
