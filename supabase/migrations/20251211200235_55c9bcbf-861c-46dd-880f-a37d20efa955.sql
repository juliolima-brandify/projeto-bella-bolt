-- Create leads table for storing user submissions
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  city TEXT NOT NULL,
  age INTEGER NOT NULL,
  weight DECIMAL NOT NULL,
  height DECIMAL NOT NULL,
  goal_weight DECIMAL NOT NULL,
  bmi_current DECIMAL NOT NULL,
  bmi_ideal DECIMAL,
  ideal_weight DECIMAL,
  original_image_url TEXT,
  transformed_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting leads (anyone can submit)
CREATE POLICY "Anyone can insert leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (true);

-- Create policy for reading own lead (by session/cookie - for now allow all reads for the result page)
CREATE POLICY "Allow read access for result page" 
ON public.leads 
FOR SELECT 
USING (true);