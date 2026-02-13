'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { parishes, services, specialProjects } from '@/lib/constants';

export function HomePage() {
  return (
    <main className='mx-auto max-w-6xl space-y-14 px-4 py-10'>
      <section className='space-y-6 text-center'>
        <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className='text-4xl font-bold md:text-6xl'>Verified help. Dispatched fast. Managed end-to-end.</motion.h1>
        <p className='mx-auto max-w-3xl text-white/80'>Plumbing, electrical, tank cleaning, AC, cleaning, landscaping, labor teams — one request.</p>
        <div className='flex justify-center gap-3'>
          <Link href='/request'><Button size='lg'>Request Service</Button></Link>
          <Link href='https://wa.me/18760000000'><Button variant='outline' size='lg'>WhatsApp Now</Button></Link>
        </div>
        <div className='flex flex-wrap justify-center gap-2'>
          {['Managed by HandyManJa','Verified workforce','Clear pricing','Same/Next-day options'].map((item) => <Badge key={item}>{item}</Badge>)}
        </div>
        <div className='flex justify-center gap-2'>{parishes.map((p) => <Badge key={p}>{p}</Badge>)}</div>
      </section>

      <section>
        <h2 className='mb-4 text-2xl font-semibold'>Core Services</h2>
        <div className='grid gap-4 md:grid-cols-4'>{services.map((s) => <Card key={s}><h3 className='font-medium'>{s}</h3><p className='my-2 text-sm text-white/70'>Fast dispatch with quality control from HandyManJa.</p><Link href='/request' className='text-accent'>Request this</Link></Card>)}</div>
      </section>

      <section>
        <h2 className='mb-4 text-2xl font-semibold'>Special Projects</h2>
        <div className='grid gap-3 md:grid-cols-2'>{specialProjects.map((p) => <Card key={p} className='flex items-center justify-between'><span>{p}</span><Link href='/request' className='text-accent'>Book a site visit</Link></Card>)}</div>
      </section>

      <section className='grid gap-4 md:grid-cols-3'>
        {['Tell us what you need','We confirm scope + quote + schedule','We dispatch verified crew + you rate'].map((s, i) => <Card key={s}><p className='text-xs text-accent'>Step {i + 1}</p><p className='mt-2 font-medium'>{s}</p></Card>)}
      </section>

      <section className='grid gap-4 md:grid-cols-2'>
        <Card>
          <h3 className='font-semibold'>Why customers choose HandyManJa</h3>
          <ul className='mt-3 list-disc space-y-1 pl-5 text-sm text-white/80'>
            <li>Verified workers and managed scheduling</li><li>Photo updates and clear scope approvals for extras</li><li>Support line when issues arise</li>
          </ul>
        </Card>
        <Card>
          <h3 className='font-semibold'>Customer stories</h3>
          <p className='mt-2 text-sm text-white/80'>“They coordinated the whole tank-cleaning and plumbing fix in one day. Clean communication from booking to completion.” — Property Manager, Kingston.</p>
        </Card>
      </section>

      <Card className='flex flex-col items-center justify-between gap-4 md:flex-row'>
        <h3 className='text-xl font-semibold'>Need it fixed today?</h3>
        <Link href='/request'><Button size='lg'>Request Service</Button></Link>
      </Card>
    </main>
  );
}
