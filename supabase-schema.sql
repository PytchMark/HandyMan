create type request_status as enum ('New','Contacted','Quoted','Scheduled','In Progress','Completed','Closed');
create type workforce_status as enum ('New','Approved','Rejected');

create table if not exists service_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  category text not null,
  details text not null,
  property_type text,
  urgency text,
  parish text,
  community text,
  address text,
  preferred_date text,
  preferred_time_window text,
  name text,
  phone text,
  email text,
  preferred_contact text,
  attachments text[] default '{}',
  status request_status default 'New',
  admin_notes text
);

create table if not exists workforce_applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  full_name text not null,
  phone text not null,
  email text,
  parish text,
  skills text[] default '{}',
  years_experience text,
  availability text,
  transportation boolean,
  tools_available boolean,
  "references" text,
  attachments text[] default '{}',
  status workforce_status default 'New',
  admin_notes text
);
