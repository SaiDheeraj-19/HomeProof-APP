-- Create saved_properties table
create table public.saved_properties (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  property_id uuid references public.properties on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, property_id)
);

-- Enable RLS
alter table public.saved_properties enable row level security;

-- Users can view their own saved properties
create policy "Users can view own saved properties."
  on saved_properties for select
  using ( auth.uid() = user_id );

-- Users can insert their own saved properties
create policy "Users can insert own saved properties."
  on saved_properties for insert
  with check ( auth.uid() = user_id );

-- Users can delete their own saved properties
create policy "Users can delete own saved properties."
  on saved_properties for delete
  using ( auth.uid() = user_id );
