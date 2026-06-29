-- Enable PostGIS
create extension if not exists postgis schema extensions;

-- Create profiles table linked to auth.users
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  first_name text,
  last_name text,
  reputation_score integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create properties table
create table public.properties (
  id uuid default gen_random_uuid() primary key,
  address text not null,
  city text not null,
  state text not null,
  zip_code text not null,
  location extensions.geography(point) not null,
  trust_score integer check (trust_score between 0 and 100),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create spatial index for properties
create index properties_location_idx on public.properties using gist (location);

-- Create reports table (community intelligence)
create table public.reports (
  id uuid default gen_random_uuid() primary key,
  property_id uuid references public.properties on delete cascade not null,
  reporter_id uuid references public.profiles on delete set null,
  report_type text not null check (report_type in ('noise', 'maintenance', 'safety', 'management', 'other')),
  description text not null,
  ai_analysis_status text default 'pending' check (ai_analysis_status in ('pending', 'analyzing', 'completed', 'failed')),
  ai_summary text,
  risk_level text check (risk_level in ('low', 'medium', 'high')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.reports enable row level security;

-- Profiles: Users can view all profiles but only update their own
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Properties: Viewable by everyone
create policy "Properties are viewable by everyone."
  on properties for select
  using ( true );

-- Reports: Viewable by everyone, insertable by authenticated users
create policy "Reports are viewable by everyone."
  on reports for select
  using ( true );

create policy "Authenticated users can insert reports."
  on reports for insert
  with check ( auth.role() = 'authenticated' );
