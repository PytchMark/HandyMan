import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Terms', description: 'Terms and conditions for using HandyManJa.' };
export default function Page() { return <main className='mx-auto max-w-5xl px-4 py-10'><h1 className='text-4xl font-bold'>Terms</h1><p className='mt-4'>By booking, you agree to scope confirmation, pricing approvals for extras, and safe site access requirements.</p></main>; }
