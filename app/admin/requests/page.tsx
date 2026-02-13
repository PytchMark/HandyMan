import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import { Card } from '@/components/ui/card';

export default async function Page() {
  const { data } = await supabaseAdmin.from('service_requests').select('*').order('created_at', { ascending: false }).limit(50);
  return <section className='space-y-4'><h1 className='text-3xl font-bold'>Requests</h1>{data?.map((r) => <Card key={r.id}><div className='flex items-center justify-between'><div><p className='font-medium'>{r.category} • {r.parish}</p><p className='text-sm text-white/70'>{r.urgency} • {r.status}</p></div><Link className='text-accent' href={`/admin/requests/${r.id}`}>View</Link></div></Card>)}</section>;
}
