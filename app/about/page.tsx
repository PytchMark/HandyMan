import { Metadata } from 'next';

export const metadata: Metadata = { title: 'About', description: 'HandyManJa mission and quality commitment.' };
export default function Page() { return <main className='mx-auto max-w-5xl space-y-4 px-4 py-10'><h1 className='text-4xl font-bold'>About HandyManJa</h1><p>We are Jamaica's on-demand workforce and property services network. Customers book with us directly. We price, schedule, dispatch, and quality-control every job end-to-end.</p></main>; }
