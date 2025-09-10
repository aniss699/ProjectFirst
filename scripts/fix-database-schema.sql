
-- Fix database schema for missing postal_code and password fields
ALTER TABLE missions ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;

-- Update existing users to have a default password if NULL
UPDATE users SET password = 'demo123' WHERE password IS NULL;

-- Make password column NOT NULL after setting defaults
ALTER TABLE users ALTER COLUMN password SET NOT NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_missions_postal_code ON missions(postal_code);
CREATE INDEX IF NOT EXISTS idx_missions_user_id ON missions(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Verify schema
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name IN ('users', 'missions') 
ORDER BY table_name, column_name;
