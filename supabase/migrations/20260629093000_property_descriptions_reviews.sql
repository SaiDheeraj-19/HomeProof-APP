-- Add description to properties
ALTER TABLE public.properties
ADD COLUMN description text;

-- Create renter_reviews table
CREATE TABLE public.renter_reviews (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE,
    renter_name text NOT NULL,
    pros text,
    cons text,
    rating numeric(2,1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on renter_reviews
ALTER TABLE public.renter_reviews ENABLE ROW LEVEL SECURITY;

-- Allow public read access to reviews
CREATE POLICY "Reviews are viewable by everyone" 
ON public.renter_reviews FOR SELECT USING (true);

-- Allow authenticated users to insert reviews
CREATE POLICY "Users can insert reviews" 
ON public.renter_reviews FOR INSERT WITH CHECK (auth.role() = 'authenticated');
