import { getSupabaseAdmin } from '@/lib/supabase';
import { Button } from '@/components/ui/button';


export default async function Page({ params }: { params: { id: string } }) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data } = await supabaseAdmin.from('service_requests').select('*').eq('id', params.id).single();
  if (!data) return <p>Not found</p>;

  async function updateStatus(formData: FormData) {
    'use server';
    const supabaseAdmin = getSupabaseAdmin();
    const status = String(formData.get('status'));
    await supabaseAdmin.from('service_requests').update({ status }).eq('id', params.id);
  }

  return <section className='space-y-3'><h1 className='text-2xl font-bold'>Request {data.id}</h1><p>{data.details}</p><p>{data.name} • {data.phone}</p><form action={updateStatus} className='flex gap-2'><select name='status' className='rounded-md bg-white/10 p-2'>{['New','Contacted','Quoted','Scheduled','In Progress','Completed','Closed'].map((s) => <option key={s}>{s}</option>)}</select><Button type='submit'>Update status</Button></form></section>;
}