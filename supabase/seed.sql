-- Nearo — category seed data
-- Curated, narrow list per prd.md § Risks ("category breadth dilutes density").
-- Fuller demo seed data (sample users/listings for the launch city) is a build-phase task,
-- not part of planning — see specs/implementation-plan.md.

insert into categories (name, slug, icon, sort_order) values
  ('Cameras & Photography', 'cameras-photography', 'camera', 1),
  ('Tools & Equipment', 'tools-equipment', 'wrench', 2),
  ('Outdoor & Camping', 'outdoor-camping', 'tent', 3),
  ('Electronics', 'electronics', 'cpu', 4),
  ('Party & Events', 'party-events', 'party-popper', 5),
  ('Sports & Fitness', 'sports-fitness', 'dumbbell', 6),
  ('Furniture & Appliances', 'furniture-appliances', 'sofa', 7),
  ('Vehicles', 'vehicles', 'car', 8);

insert into categories (name, slug, icon, parent_id, sort_order)
select 'DSLR & Mirrorless Cameras', 'dslr-mirrorless-cameras', 'camera', id, 1 from categories where slug = 'cameras-photography'
union all
select 'Drones', 'drones', 'drone', id, 2 from categories where slug = 'cameras-photography'
union all
select 'Lighting & Audio', 'lighting-audio', 'mic', id, 3 from categories where slug = 'cameras-photography'
union all
select 'Power Tools', 'power-tools', 'drill', id, 1 from categories where slug = 'tools-equipment'
union all
select 'Hand Tools', 'hand-tools', 'hammer', id, 2 from categories where slug = 'tools-equipment'
union all
select 'Tents & Shelters', 'tents-shelters', 'tent', id, 1 from categories where slug = 'outdoor-camping'
union all
select 'Trekking & Climbing Gear', 'trekking-climbing-gear', 'mountain', id, 2 from categories where slug = 'outdoor-camping'
union all
select 'Laptops & Projectors', 'laptops-projectors', 'monitor', id, 1 from categories where slug = 'electronics'
union all
select 'Gaming Consoles', 'gaming-consoles', 'gamepad-2', id, 2 from categories where slug = 'electronics'
union all
select 'Sound Systems & DJ Gear', 'sound-systems-dj-gear', 'speaker', id, 1 from categories where slug = 'party-events'
union all
select 'Decor & Furniture', 'decor-furniture', 'lamp', id, 2 from categories where slug = 'party-events'
union all
select 'Cycles', 'cycles', 'bike', id, 1 from categories where slug = 'sports-fitness'
union all
select 'Gym Equipment', 'gym-equipment', 'dumbbell', id, 2 from categories where slug = 'sports-fitness'
union all
select 'Two-Wheelers', 'two-wheelers', 'bike', id, 1 from categories where slug = 'vehicles'
union all
select 'Trailers & Trolleys', 'trailers-trolleys', 'truck', id, 2 from categories where slug = 'vehicles';
