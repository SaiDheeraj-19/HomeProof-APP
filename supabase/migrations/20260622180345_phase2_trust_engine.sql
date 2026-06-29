-- 1. Add severity and resolution status to reports
ALTER TABLE public.reports 
ADD COLUMN resolution_status text DEFAULT 'unresolved' CHECK (resolution_status in ('unresolved', 'resolving', 'resolved')),
ADD COLUMN media_urls text[] DEFAULT '{}';

-- 2. Modify properties table to default trust_score to 100
ALTER TABLE public.properties
ALTER COLUMN trust_score SET DEFAULT 100;

-- Update existing properties
UPDATE public.properties SET trust_score = 100 WHERE trust_score IS NULL;

-- 3. Create Storage Bucket for Report Media
insert into storage.buckets (id, name, public)
values ('report_media', 'report_media', true)
on conflict do nothing;

-- Storage RLS Policies
create policy "Media is publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'report_media' );

create policy "Authenticated users can upload media."
  on storage.objects for insert
  with check ( bucket_id = 'report_media' and auth.role() = 'authenticated' );