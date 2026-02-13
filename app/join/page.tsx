import { Metadata } from 'next';
import { JoinForm } from '@/components/forms/join-form';

export const metadata: Metadata = { title: 'Join Workforce', description: 'Apply to join HandyManJa vetted workforce network.' };
export default function Page() { return <main className='mx-auto max-w-3xl px-4 py-10'><h1 className='mb-4 text-4xl font-bold'>Join the Workforce</h1><JoinForm /></main>; }
