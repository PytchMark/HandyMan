import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const client = createClient(env.supabaseUrl, env.supabaseAnonKey);
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.session) return NextResponse.json({ error: 'Invalid login' }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set('sb_access_token', data.session.access_token, { httpOnly: true, sameSite: 'lax', secure: true, path: '/' });
  return res;
}
