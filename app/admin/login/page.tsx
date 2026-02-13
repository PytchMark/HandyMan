'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Page() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  return <main className='mx-auto max-w-md space-y-4 px-4 py-20'><h1 className='text-3xl font-bold'>Admin Login</h1><Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder='Email' /><Input type='password' value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Password' /><Button onClick={async () => { const res = await fetch('/api/admin/login', { method: 'POST', body: JSON.stringify({ email, password }) }); if (res.ok) router.push('/admin'); }}>Login</Button></main>;
}
