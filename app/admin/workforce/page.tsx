import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabase';
import { Card } from '@/components/ui/card';


export default async function Page() {
  const supabaseAdmin = getSupabaseAdmin();
  const { data } = await supabaseAdmin.from('workforce_applications').select('*').order('created_at', { ascending: false }).limit(50);
  return <section className='space-y-4'><h1 className='text-3xl font-bold'>Workforce</h1>{data?.map((r) => <Card key={r.id}><div className='flex items-center justify-between'><div><p className='font-medium'>{r.full_name} • {r.parish}</p><p className='text-sm text-white/70'>{(r.skills || []).join(', ')} • {r.status}</p></div><Link className='text-accent' href={`/admin/workforce/${r.id}`}>View</Link></div></Card>)}</section>;
}