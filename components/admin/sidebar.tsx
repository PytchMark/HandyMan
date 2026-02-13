import Link from 'next/link';

export function AdminSidebar() {
  return <aside className='glass h-fit rounded-xl p-4'><p className='mb-3 font-semibold'>Admin</p><div className='space-y-2 text-sm'><Link href='/admin/requests'>Requests</Link><br /><Link href='/admin/workforce'>Workforce</Link></div></aside>;
}
