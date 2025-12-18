/*
  # Image Transformations Cache and Storage

  1. New Tables
    - `image_transformations`
      - `id` (uuid, primary key)
      - `lead_id` (uuid, foreign key to leads)
      - `original_hash` (text, MD5 hash of original image)
      - `transformed_url` (text, URL to transformed image in storage)
      - `created_at` (timestamptz)
      - `expires_at` (timestamptz, 90 days from creation)
    
    - `transformation_logs`
      - `id` (uuid, primary key)
      - `lead_id` (uuid, foreign key to leads)
      - `status` (text, 'success' or 'error')
      - `error_message` (text, nullable)
      - `processing_time_ms` (integer)
      - `created_at` (timestamptz)

  2. Storage
    - Create public bucket 'transformed-images' for storing transformed images

  3. Security
    - Enable RLS on both tables
    - Add policies for authenticated access
    - Public read access for transformed-images bucket

  4. Indexes
    - Index on original_hash for fast cache lookups
    - Index on expires_at for cleanup queries
*/

-- Create image_transformations table
CREATE TABLE IF NOT EXISTS image_transformations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  original_hash text NOT NULL,
  transformed_url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '90 days')
);

-- Create transformation_logs table
CREATE TABLE IF NOT EXISTS transformation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('success', 'error')),
  error_message text,
  processing_time_ms integer,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE image_transformations ENABLE ROW LEVEL SECURITY;
ALTER TABLE transformation_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for image_transformations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'image_transformations' AND policyname = 'Anyone can read image transformations'
  ) THEN
    CREATE POLICY "Anyone can read image transformations"
      ON image_transformations FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'image_transformations' AND policyname = 'Service role can insert image transformations'
  ) THEN
    CREATE POLICY "Service role can insert image transformations"
      ON image_transformations FOR INSERT
      TO service_role
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'image_transformations' AND policyname = 'Service role can update image transformations'
  ) THEN
    CREATE POLICY "Service role can update image transformations"
      ON image_transformations FOR UPDATE
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- RLS Policies for transformation_logs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'transformation_logs' AND policyname = 'Service role can insert transformation logs'
  ) THEN
    CREATE POLICY "Service role can insert transformation logs"
      ON transformation_logs FOR INSERT
      TO service_role
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'transformation_logs' AND policyname = 'Service role can read transformation logs'
  ) THEN
    CREATE POLICY "Service role can read transformation logs"
      ON transformation_logs FOR SELECT
      TO service_role
      USING (true);
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_image_transformations_hash 
  ON image_transformations(original_hash);

CREATE INDEX IF NOT EXISTS idx_image_transformations_expires 
  ON image_transformations(expires_at);

CREATE INDEX IF NOT EXISTS idx_transformation_logs_created 
  ON transformation_logs(created_at DESC);

-- Create storage bucket for transformed images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'transformed-images',
  'transformed-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for public read access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Public read access for transformed images'
  ) THEN
    CREATE POLICY "Public read access for transformed images"
      ON storage.objects FOR SELECT
      TO public
      USING (bucket_id = 'transformed-images');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Service role can upload transformed images'
  ) THEN
    CREATE POLICY "Service role can upload transformed images"
      ON storage.objects FOR INSERT
      TO service_role
      WITH CHECK (bucket_id = 'transformed-images');
  END IF;
END $$;