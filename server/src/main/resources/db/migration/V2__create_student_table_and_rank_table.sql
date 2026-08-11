CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- rank master
CREATE TABLE rank_master (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(64) NOT NULL,
    level INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO rank_master (name, level) VALUES
    ('Deck Cadet', 1),
    ('Ordinary Seaman', 2),
    ('Able Seaman', 3),
    ('Third Officer', 4),
    ('Second Officer', 5),
    ('Chief Officer', 6),
    ('Master', 7);

-- student table
CREATE TABLE indos_master (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    indos VARCHAR(7) NOT NULL UNIQUE,
    first_name VARCHAR(255) NOT NULL,
    rank_id UUID NOT NULL REFERENCES rank_master(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_indos_master_rank_id ON indos_master(rank_id);

CREATE OR REPLACE FUNCTION set_update_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_indos_master_updated_at
BEFORE UPDATE ON indos_master
FOR EACH ROW EXECUTE FUNCTION set_update_at();