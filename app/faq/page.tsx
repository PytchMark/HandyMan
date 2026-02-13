import { Metadata } from 'next';

export const metadata: Metadata = { title: 'FAQ', description: 'Frequently asked questions for HandyManJa services.' };
export default function Page() { return <main className='mx-auto max-w-5xl space-y-4 px-4 py-10'><h1 className='text-4xl font-bold'>FAQ</h1><p><strong>Do I choose the worker?</strong> No. HandyManJa assigns vetted crews based on your request.</p><p><strong>How fast can you come?</strong> Same/next-day options are available depending on scope and location.</p></main>; }
