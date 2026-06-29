-- Add role to profiles
ALTER TABLE public.profiles
ADD COLUMN role text DEFAULT 'renter' CHECK (role in ('renter', 'owner'));

-- Link properties to owners
ALTER TABLE public.properties
ADD COLUMN owner_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Add resolution details to reports
ALTER TABLE public.reports
ADD COLUMN resolution_text text,
ADD COLUMN resolution_media_urls text[] DEFAULT '{}';

-- Create an index for querying properties by owner
CREATE INDEX properties_owner_idx ON public.properties (owner_id);
