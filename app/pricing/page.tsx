import { Metadata } from 'next';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = { title: 'Pricing', description: 'Transparent starting prices with final quotes after assessment.' };

export default function PricingPage() {
  return <main className='mx-auto max-w-5xl space-y-5 px-4 py-10'><h1 className='text-4xl font-bold'>Pricing</h1><p className='text-white/80'>All prices are starting-from estimates. Final quote depends on site conditions and approved scope.</p><Card><p>Service call fee from JMD 6,000 (Kingston Metro). Emergency same-day premium applies after-hours and public holidays.</p></Card><Card><h2 className='font-semibold'>Plans (Coming Soon)</h2><p>Home Care Plan and Property Manager Plan waitlist available by email at support@handymanja.com.</p></Card></main>;
}
