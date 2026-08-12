CREATE TYPE enrollment_status AS ENUM ('ENROLLED', 'COMPLETED', 'CANCELLED');

CREATE TABLE enrollment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pre_sea_course_id UUID NOT NULL REFERENCES pre_sea_courses(id),
    indos_master_id UUID NOT NULL REFERENCES indos_master(id),
    status enrollment_status NOT NULL DEFAULT 'ENROLLED',
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_enrollment_pre_sea_course_id ON enrollment(pre_sea_course_id);
CREATE INDEX idx_enrollment_indos_master_id ON enrollment(indos_master_id);

-- prevents a student from having two ENROLLED rows for the same course
-- (re-enrollment allowed after CANCELLED/COMPLETED)
CREATE UNIQUE INDEX idx_enrollment_unique_active
ON enrollment(pre_sea_course_id, indos_master_id)
WHERE status = 'ENROLLED';

CREATE TRIGGER trg_enrollment_updated_at
BEFORE UPDATE ON enrollment
FOR EACH ROW EXECUTE FUNCTION set_update_at();