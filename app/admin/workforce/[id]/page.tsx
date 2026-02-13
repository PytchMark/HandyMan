import { supabaseAdmin } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

export default async function Page({ params }: { params: { id: string } }) {
  const { data } = await supabaseAdmin.from('workforce_applications').select('*').eq('id', params.id).single();
  if (!data) return <p>Not found</p>;

  async function updateStatus(formData: FormData) {
    'use server';
    const status = String(formData.get('status'));
    await supabaseAdmin.from('workforce_applications').update({ status }).eq('id', params.id);
  }

  return <section className='space-y-3'><h1 className='text-2xl font-bold'>{data.full_name}</h1><p>{data.references}</p><form action={updateStatus} className='flex gap-2'><select name='status' className='rounded-md bg-white/10 p-2'>{['New','Approved','Rejected'].map((s) => <option key={s}>{s}</option>)}</select><Button type='submit'>Update status</Button></form></section>;
}
