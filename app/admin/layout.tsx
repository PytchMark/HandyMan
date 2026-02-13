import { ReactNode } from 'react';
import { AdminSidebar } from '@/components/admin/sidebar';

export default function Layout({ children }: { children: ReactNode }) {
  return <main className='mx-auto grid max-w-6xl gap-4 px-4 py-8 md:grid-cols-[220px_1fr]'><AdminSidebar />{children}</main>;
}
