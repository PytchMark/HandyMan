import { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { services } from '@/lib/constants';

export const metadata: Metadata = { title: 'Services', description: 'Book verified property and workforce services across Jamaica.' };

export default function ServicesPage() {
  return <main className='mx-auto max-w-6xl px-4 py-10'><h1 className='mb-6 text-4xl font-bold'>Services</h1><div className='grid gap-4 md:grid-cols-2'>{services.map((s) => <Card key={s}><h2 className='font-semibold'>{s}</h2><p className='text-sm text-white/80'>Included: managed dispatch, vetted crew, scope confirmation, follow-up support. Starting from JMD 8,500. Typical turnaround within 24-48 hours.</p><Link href='/request' className='mt-2 inline-block text-accent'>Request Service</Link></Card>)}</div></main>;
}
