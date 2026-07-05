-- WORKING FIX: Update existing profile instead of insert
-- Copy and paste this into Supabase SQL Editor and click RUN

-- First, check if profile exists and what UUID it is
SELECT id, email, first_name FROM profiles WHERE email = 'demo@cank.local';

-- If it shows a result, copy that UUID and use it in the next queries below...
