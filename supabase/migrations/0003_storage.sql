-- Nearo — Storage bucket for listing images.
-- Implements the M2 (Listings Core) image-upload prerequisite from
-- specs/implementation-plan.md. Public bucket: listing photos are meant to be
-- publicly viewable on the product page without signed URLs.

insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

-- Path convention: {owner_id}/{product_id}/{filename} — the first path
-- segment must be the uploader's own auth.uid() for write access.
create policy "listing_images_public_read"
  on storage.objects for select
  using (bucket_id = 'listing-images');

create policy "listing_images_owner_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'listing-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "listing_images_owner_delete"
  on storage.objects for delete
  using (
    bucket_id = 'listing-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
