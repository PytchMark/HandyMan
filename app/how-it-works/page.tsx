import { Metadata } from 'next';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = { title: 'How It Works', description: 'Our managed three-step dispatch and quality process.' };
export default function Page() { return <main className='mx-auto max-w-5xl space-y-4 px-4 py-10'><h1 className='text-4xl font-bold'>How It Works</h1><Card>1) Tell us what you need via form or WhatsApp.</Card><Card>2) We confirm scope, quote, and schedule.</Card><Card>3) We dispatch verified crew and manage quality checks with support SLAs.</Card></main>; }
