import { ReactNode } from 'react';

export function StaticPage({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <main className='mx-auto max-w-5xl space-y-6 px-4 py-10'>
      <h1 className='text-4xl font-bold'>{title}</h1>
      <p className='text-white/80'>{intro}</p>
      {children}
    </main>
  );
}
