-- Insert mock property data for Kurnool, Andhra Pradesh

INSERT INTO public.properties (address, city, state, zip_code, rent_price, bedrooms, bathrooms, sqft, cover_image, is_listed, trust_score)
VALUES 
(
  'Plot 45, Nandyal Road',
  'Kurnool',
  'AP',
  '518002',
  1800,
  3,
  2,
  1500,
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80',
  true,
  98
),
(
  'Apt 12B, C-Camp Center',
  'Kurnool',
  'AP',
  '518003',
  1200,
  2,
  2,
  1100,
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80',
  true,
  100
),
(
  'Villa 7, Venkataramana Colony',
  'Kurnool',
  'AP',
  '518004',
  2500,
  4,
  3.5,
  2800,
  'https://images.unsplash.com/photo-1613490908236-4c4c23f2b4bc?auto=format&fit=crop&w=1000&q=80',
  true,
  85
),
(
  'Flat 304, B-Camp Area',
  'Kurnool',
  'AP',
  '518005',
  900,
  1,
  1,
  800,
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80',
  true,
  92
);
