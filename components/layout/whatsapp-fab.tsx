import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { env } from '@/lib/env';

export function WhatsAppFab() {
  return (
    <Link href={`https://wa.me/${env.whatsappNumber}`} className='fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white shadow-lg'>
      <MessageCircle size={20} />
    </Link>
  );
}
