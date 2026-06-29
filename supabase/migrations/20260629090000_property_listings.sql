-- Add Real Estate Listing fields to properties table
ALTER TABLE public.properties
ADD COLUMN rent_price integer,
ADD COLUMN bedrooms integer,
ADD COLUMN bathrooms numeric(3,1),
ADD COLUMN sqft integer,
ADD COLUMN cover_image text,
ADD COLUMN is_listed boolean DEFAULT true;

-- Update existing properties to be listed and have some default values
UPDATE public.properties 
SET is_listed = true, 
    rent_price = 2500, 
    bedrooms = 2, 
    bathrooms = 2, 
    sqft = 1200,
    cover_image = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
WHERE rent_price IS NULL;
