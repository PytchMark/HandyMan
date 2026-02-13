import Link from 'next/link';
import { Card } from '@/components/ui/card';

export default function Page() {
  return <section className='space-y-4'><h1 className='text-3xl font-bold'>Dashboard</h1><Card><p>Manage requests and workforce applications.</p><div className='mt-3 flex gap-3'><Link href='/admin/requests' className='text-accent'>Open requests</Link><Link href='/admin/workforce' className='text-accent'>Open workforce</Link></div></Card></section>;
}
