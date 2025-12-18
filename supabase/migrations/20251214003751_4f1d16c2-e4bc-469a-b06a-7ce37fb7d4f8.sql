-- Add new columns to leads table
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS gender text DEFAULT 'feminino',
ADD COLUMN IF NOT EXISTS symptoms text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tmb numeric;

-- Make goal_weight nullable since we'll calculate it from IMC 22
ALTER TABLE public.leads 
ALTER COLUMN goal_weight DROP NOT NULL;