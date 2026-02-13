import { NextRequest, NextResponse } from 'next/server';
import { allowRequest } from '@/lib/rate-limit';
import { workforceSchema } from '@/lib/validators';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sendNotification } from '@/lib/email';


export async function POST(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  if (!allowRequest(`join:${ip}`)) return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
  const payload = workforceSchema.parse(await req.json());
  if (payload.honeypot) return NextResponse.json({ error: 'Spam blocked' }, { status: 400 });

  const { error } = await supabaseAdmin.from('workforce_applications').insert({
    full_name: payload.fullName,
    phone: payload.phone,
    email: payload.email,
    parish: payload.parish,
    skills: payload.skills,
    years_experience: payload.yearsExperience,
    availability: payload.availability,
    transportation: payload.transportation,
    tools_available: payload.toolsAvailable,
    references: payload.references,
    attachments: payload.attachments || [],
    status: 'New'
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await sendNotification('New workforce application', `${payload.fullName} from ${payload.parish}`);
  return NextResponse.json({ ok: true });
}