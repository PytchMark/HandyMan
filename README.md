# ClickTrade (working name)

Booking-first marketplace for trusted skilled workers in Jamaica. Built as a new vertical with three frontends:
- `/storefront` (public customer acquisition)
- `/worker` (provider portal)
- `/admin` (system owner console)

## Tech Stack
- Frontend: vanilla HTML/CSS/JS
- Backend: Node.js + Express
- DB: Supabase Postgres (service role only in backend)
- Media: Cloudinary via backend upload endpoint
- Auth: passcode-on-profile for workers + JWT sessions
- Deploy: Cloud Run with Docker

## Local setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create env file:
   ```bash
   cp .env.example .env
   ```
3. Fill required env vars in `.env`.
4. Run:
   ```bash
   npm run dev
   ```
5. Open:
   - `http://localhost:8080/storefront`
   - `http://localhost:8080/worker`
   - `http://localhost:8080/admin`

## Environment variables
See `.env.example`:
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- `ADMIN_EMAIL` or `ADMIN_USERNAME`, `ADMIN_PASSWORD`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

## SQL Schema (Supabase)
```sql
create extension if not exists pgcrypto;

create table if not exists profiles (
  worker_id text primary key,
  name text,
  status text default 'active',
  parish text,
  categories text[] default '{}',
  whatsapp text,
  profile_email text,
  password text,
  logo_url text,
  bio text,
  experience_years int,
  qualifications text,
  social_links jsonb,
  is_featured boolean default false,
  rating_avg numeric default 0,
  rating_count int default 0,
  requests_last_30d int default 0,
  created_at timestamptz default now()
);

create table if not exists portfolio_media (
  id uuid primary key default gen_random_uuid(),
  worker_id text references profiles(worker_id) on delete cascade,
  media_type text check (media_type in ('image','video')),
  url text,
  caption text,
  created_at timestamptz default now()
);

create table if not exists job_requests (
  request_id text primary key,
  worker_id text references profiles(worker_id) on delete cascade,
  status text default 'new',
  customer_name text,
  phone text,
  email text,
  service_category text,
  urgency text,
  request_type text,
  parish text,
  address_details text,
  preferred_time text,
  notes text,
  source text default 'storefront',
  created_at timestamptz default now()
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  worker_id text references profiles(worker_id),
  request_id text references job_requests(request_id),
  stars int,
  comment text,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table portfolio_media enable row level security;
alter table job_requests enable row level security;
alter table reviews enable row level security;

-- MVP option: disable RLS for server-role-only architecture
alter table profiles disable row level security;
alter table portfolio_media disable row level security;
alter table job_requests disable row level security;
alter table reviews disable row level security;
```

## Seed data (2-3 workers)
```sql
insert into profiles (worker_id, name, parish, categories, whatsapp, profile_email, password, is_featured, rating_avg, rating_count, requests_last_30d, bio, status)
values
('WORKER-001','Andre Williams','Kingston',array['Electrical','AC Repair'],'18765550001','andre@clicktradejm.com','1234',true,4.9,24,35,'Licensed electrician with 10+ years in residential and commercial projects.','active'),
('WORKER-002','Kimberly Scott','St. James',array['Plumbing','Masonry'],'18765550002','kim@clicktradejm.com','1234',false,4.8,15,18,'Fast, clean plumbing service with transparent pricing.','active'),
('WORKER-003','Rico Brown','Manchester',array['Carpentry','Painting'],'18765550003','rico@clicktradejm.com','1234',false,0,0,4,'New on ClickTrade. Premium finishes and reliable response.','active')
on conflict (worker_id) do update set name=excluded.name;

insert into portfolio_media (worker_id, media_type, url, caption)
values
('WORKER-001','image','https://images.unsplash.com/photo-1581578731548-c64695cc6952','Panel upgrade project'),
('WORKER-002','image','https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1','Bathroom leak repair');
```

## API routes implemented
### Public
- `GET /api/public/workers?parish=&category=&q=`
- `GET /api/public/workers/:workerId`
- `GET /api/public/workers/:workerId/portfolio`
- `POST /api/public/workers/:workerId/requests`

### Worker
- `POST /api/worker/login`
- `GET /api/worker/me`
- `POST /api/worker/profile`
- `GET /api/worker/requests`
- `POST /api/worker/requests/:requestId/status`
- `GET /api/worker/portfolio`
- `POST /api/worker/portfolio`
- `POST /api/media/upload`

### Admin
- `POST /api/admin/login`
- `GET /api/admin/workers`
- `POST /api/admin/workers`
- `POST /api/admin/workers/:workerId/reset-passcode`
- `GET /api/admin/requests`

## Cloud Run deploy notes
```bash
gcloud builds submit --tag gcr.io/$GOOGLE_CLOUD_PROJECT/clicktrade
gcloud run deploy clicktrade \
  --image gcr.io/$GOOGLE_CLOUD_PROJECT/clicktrade \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars NODE_ENV=production
```
Set secrets/env vars in Cloud Run for Supabase, JWT, Cloudinary, and admin credentials.
