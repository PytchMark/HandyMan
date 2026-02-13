import { Metadata } from 'next';
import { RequestForm } from '@/components/forms/request-form';

export const metadata: Metadata = { title: 'Request Service', description: 'Submit a managed service request and get dispatched fast.' };
export default function Page() { return <main className='mx-auto max-w-3xl px-4 py-10'><h1 className='mb-4 text-4xl font-bold'>Request a Service</h1><RequestForm /></main>; }
