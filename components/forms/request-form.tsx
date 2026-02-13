'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { requestSchema } from '@/lib/validators';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { services, parishes } from '@/lib/constants';

type Values = z.infer<typeof requestSchema>;

export function RequestForm() {
  const [step, setStep] = useState(1);
  const [result, setResult] = useState<{ referenceId: string; whatsappLink: string } | null>(null);
  const form = useForm<Values>({ resolver: zodResolver(requestSchema), defaultValues: { attachments: [], consent: false, preferredContact: 'WhatsApp' } });

  const submit = form.handleSubmit(async (values) => {
    const res = await fetch('/api/request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
    const json = await res.json();
    setResult(json);
  });

  if (result) return <div className='space-y-4'><h2 className='text-2xl font-semibold'>Request received</h2><p>Reference ID: {result.referenceId}</p><a className='text-accent' href={result.whatsappLink}>Open WhatsApp with details</a></div>;

  return (
    <form onSubmit={submit} className='space-y-4'>
      <input className='hidden' {...form.register('honeypot')} />
      {step === 1 && <div><label>Service Category</label><select className='w-full rounded-md bg-white/5 p-2' {...form.register('category')}>{services.map((s) => <option key={s}>{s}</option>)}</select></div>}
      {step === 2 && <><Textarea placeholder='Job details' {...form.register('details')} /><Input placeholder='Property type' {...form.register('propertyType')} /><Input placeholder='Urgency (today/this week/flexible)' {...form.register('urgency')} /><select className='w-full rounded-md bg-white/5 p-2' {...form.register('parish')}>{parishes.map((p) => <option key={p}>{p}</option>)}</select><Input placeholder='Community' {...form.register('community')} /><Input placeholder='Address (optional)' {...form.register('address')} /></>}
      {step === 3 && <><Input placeholder='Preferred date' type='date' {...form.register('preferredDate')} /><Input placeholder='Preferred time window' {...form.register('preferredTimeWindow')} /><p className='text-sm text-white/70'>Uploads are supported in production via Supabase storage URL fields.</p></>}
      {step === 4 && <><Input placeholder='Name' {...form.register('name')} /><Input placeholder='Phone' {...form.register('phone')} /><Input placeholder='Email (optional)' {...form.register('email')} /><select className='w-full rounded-md bg-white/5 p-2' {...form.register('preferredContact')}><option>WhatsApp</option><option>Call</option><option>Email</option></select><label className='flex gap-2 text-sm'><input type='checkbox' {...form.register('consent')} />I consent to being contacted about this request.</label></>}
      <div className='flex gap-2'>
        {step > 1 && <Button type='button' variant='outline' onClick={() => setStep(step - 1)}>Back</Button>}
        {step < 4 ? <Button type='button' onClick={() => setStep(step + 1)}>Next</Button> : <Button type='submit'>Submit Request</Button>}
      </div>
    </form>
  );
}
