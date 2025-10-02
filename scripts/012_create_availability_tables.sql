
-- Create user_availability table
CREATE TABLE IF NOT EXISTS user_availability (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  rate DECIMAL(10, 2) NOT NULL DEFAULT 0,
  is_booked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, date, start_time, end_time)
);

-- Create recurring_availability table for weekly patterns
CREATE TABLE IF NOT EXISTS recurring_availability (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  rate DECIMAL(10, 2) NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, day_of_week, start_time)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_availability_user_date ON user_availability(user_id, date);
CREATE INDEX IF NOT EXISTS idx_user_availability_date ON user_availability(date);
CREATE INDEX IF NOT EXISTS idx_recurring_availability_user ON recurring_availability(user_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_availability_updated_at 
  BEFORE UPDATE ON user_availability 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_availability_updated_at 
  BEFORE UPDATE ON recurring_availability 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Log migration
INSERT INTO migrations_log (migration_name, executed_at) 
VALUES ('012_create_availability_tables', NOW())
ON CONFLICT (migration_name) DO NOTHING;
