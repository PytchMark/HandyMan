import { createClient } from '@supabase/supabase-js';
import { env } from './env';

const assertSupabaseEnv = () => {
  if (!env.supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL. Set it in the build/runtime environment.');
  }

  if (!env.supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY. Set it in the build/runtime environment.');
  }
};

export const getSupabaseAdmin = () => {
  assertSupabaseEnv();

  if (!env.supabaseServiceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY. Set it in the runtime environment.');
  }

  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
};

export const getSupabasePublic = () => {
  assertSupabaseEnv();
  return createClient(env.supabaseUrl, env.supabaseAnonKey);
};
