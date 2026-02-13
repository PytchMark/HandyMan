'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

const links = [
  ['Services', '/services'],['Pricing', '/pricing'],['How it works', '/how-it-works'],['Join', '/join'],['Contact', '/contact']
];

export function Navbar() {
  return (
    <header className='sticky top-0 z-40 border-b border-white/10 bg-black/40 backdrop-blur-md'>
      <nav className='mx-auto flex max-w-6xl items-center justify-between px-4 py-3'>
        <Link href='/' className='font-semibold tracking-wide'>HandyManJa</Link>
        <div className='hidden gap-5 md:flex'>
          {links.map(([label, href]) => <Link key={href} href={href} className='text-sm text-white/85 hover:text-white'>{label}</Link>)}
        </div>
        <div className='flex gap-2'>
          <Link href='/join'><Button variant='outline' size='sm'>Join Workforce</Button></Link>
          <Link href='/request'><Button size='sm'>Request Service</Button></Link>
        </div>
      </nav>
    </header>
  );
}
