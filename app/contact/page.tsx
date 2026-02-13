import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Contact', description: 'Reach HandyManJa via WhatsApp, phone, or email.' };
export default function Page() { return <main className='mx-auto max-w-5xl space-y-3 px-4 py-10'><h1 className='text-4xl font-bold'>Contact</h1><p>WhatsApp: +1 876 000 0000</p><p>Phone: +1 876 000 0000</p><p>Email: support@handymanja.com</p><p>Parishes served now: Kingston, St Andrew, St Catherine.</p></main>; }
