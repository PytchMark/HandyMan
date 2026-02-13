import { NextRequest, NextResponse } from 'next/server';
import { allowRequest } from '@/lib/rate-limit';
import { requestSchema } from '@/lib/validators';
import { getSupabaseAdmin } from '@/lib/supabase';
import { createWhatsAppLink } from '@/lib/whatsapp';
import { sendNotification } from '@/lib/email';


export async function POST(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  if (!allowRequest(`request:${ip}`)) return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
  const payload = requestSchema.parse(await req.json());
  if (payload.honeypot) return NextResponse.json({ error: 'Spam blocked' }, { status: 400 });

  const { data, error } = await supabaseAdmin.from('service_requests').insert({
    category: payload.category,
    details: payload.details,
    property_type: payload.propertyType,
    urgency: payload.urgency,
    parish: payload.parish,
    community: payload.community,
    address: payload.address,
    preferred_date: payload.preferredDate,
    preferred_time_window: payload.preferredTimeWindow,
    name: payload.name,
    phone: payload.phone,
    email: payload.email,
    preferred_contact: payload.preferredContact,
    attachments: payload.attachments || [],
    status: 'New'
  }).select('id').single();

  if (error || !data) return NextResponse.json({ error: error?.message || 'Insert failed' }, { status: 500 });
  const whatsappLink = createWhatsAppLink({ category: payload.category, parish: payload.parish, urgency: payload.urgency, referenceId: data.id });
  await sendNotification('New service request', `Request ${data.id} - ${payload.category} in ${payload.parish}`);

  return NextResponse.json({ referenceId: data.id, whatsappLink });
}