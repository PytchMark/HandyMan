'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { workforceSchema } from '@/lib/validators';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

type Values = z.infer<typeof workforceSchema>;

export function JoinForm() {
  const [done, setDone] = useState(false);
  const form = useForm<Values>({ resolver: zodResolver(workforceSchema), defaultValues: { skills: [], transportation: false, toolsAvailable: false, attachments: [] } });
  const submit = form.handleSubmit(async (values) => {
    await fetch('/api/join', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
    setDone(true);
  });
  if (done) return <p>Application received. We'll contact you for vetting.</p>;

  return <form onSubmit={submit} className='space-y-3'><input className='hidden' {...form.register('honeypot')} /><Input placeholder='Full name' {...form.register('fullName')} /><Input placeholder='Phone' {...form.register('phone')} /><Input placeholder='Email (optional)' {...form.register('email')} /><Input placeholder='Parish' {...form.register('parish')} /><Input placeholder='Skills (comma separated)' onChange={(e) => form.setValue('skills', e.target.value.split(',').map((s) => s.trim()))} /><Input placeholder='Years experience' {...form.register('yearsExperience')} /><Textarea placeholder='Availability' {...form.register('availability')} /><label className='flex gap-2'><input type='checkbox' onChange={(e) => form.setValue('transportation', e.target.checked)} />Transportation</label><label className='flex gap-2'><input type='checkbox' onChange={(e) => form.setValue('toolsAvailable', e.target.checked)} />Tools available</label><Textarea placeholder='References' {...form.register('references')} /><Button type='submit'>Submit Application</Button></form>;
}
