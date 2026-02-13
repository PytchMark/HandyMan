import { ReactNode } from 'react';
import { Navbar } from './navbar';
import { Footer } from './footer';
import { WhatsAppFab } from './whatsapp-fab';

export function SiteShell({ children }: { children: ReactNode }) {
  return <><Navbar />{children}<Footer /><WhatsAppFab /></>;
}
