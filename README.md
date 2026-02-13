# HandyManJa Web Platform

Production-ready Next.js 14 platform for customer bookings, workforce applications, and internal admin dispatch operations.

## Stack
- Next.js 14 App Router + TypeScript
- TailwindCSS + shadcn/ui patterns
- Framer Motion micro-interactions
- Supabase (DB, Auth, Storage)
- Resend for notifications
- Docker + Cloud Run deployment

## Local setup
1. `cp .env.example .env.local`
2. Fill all Supabase and Resend credentials.
3. `npm install`
4. `npm run dev`

## Environment variables
See `.env.example`.

## Supabase schema
Run SQL in `supabase-schema.sql`.

Create a storage bucket named `uploads` and set RLS policies for authenticated admin read and public signed-upload as needed.

## Cloud Run deploy
1. Build image: `gcloud builds submit --tag gcr.io/<PROJECT_ID>/handymanja`
2. Deploy: `gcloud run deploy handymanja --image gcr.io/<PROJECT_ID>/handymanja --platform managed --allow-unauthenticated --region us-central1 --port 8080`
3. Configure env vars in Cloud Run service settings.

## Health check
`GET /api/health` returns `{ ok: true }`.

## Verification checklist
- Submit `/request` form and confirm row in `service_requests`.
- Submit `/join` form and confirm row in `workforce_applications`.
- Confirm notification emails are sent.
- Log in at `/admin/login` with Supabase admin credentials.
- Review and update request/workforce statuses in admin detail pages.
- Validate WhatsApp deep-link from request confirmation.
