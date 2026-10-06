CREATE TABLE equipment (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL
);

CREATE TABLE bookings (
  id TEXT PRIMARY KEY,
  equipment_id TEXT NOT NULL REFERENCES equipment(id),
  borrower_name TEXT NOT NULL,
  start_at TEXT NOT NULL,
  end_at TEXT NOT NULL,
  purpose TEXT NOT NULL,
  CHECK (start_at < end_at)
);

CREATE INDEX bookings_equipment_time ON bookings(equipment_id, start_at, end_at);

-- SQLite evaluates the overlap check during the write, making it safe from
-- simultaneous Worker requests that could both pass a separate SELECT check.
CREATE TRIGGER bookings_no_overlap_insert BEFORE INSERT ON bookings
WHEN EXISTS (
  SELECT 1 FROM bookings
  WHERE equipment_id = NEW.equipment_id
    AND start_at < NEW.end_at AND end_at > NEW.start_at
)
BEGIN
  SELECT RAISE(ABORT, 'booking_overlap');
END;

CREATE TRIGGER bookings_no_overlap_update BEFORE UPDATE ON bookings
WHEN EXISTS (
  SELECT 1 FROM bookings
  WHERE equipment_id = NEW.equipment_id AND id != OLD.id
    AND start_at < NEW.end_at AND end_at > NEW.start_at
)
BEGIN
  SELECT RAISE(ABORT, 'booking_overlap');
END;

INSERT INTO equipment (id, name, location) VALUES
  ('eq-1', 'Projector A', 'Building 1'),
  ('eq-2', 'Camera B', 'Media Lab');
