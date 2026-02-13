import Link from 'next/link';

export function Footer() {
  return (
    <footer className='mt-16 border-t border-white/10 py-10'>
      <div className='mx-auto grid max-w-6xl gap-4 px-4 text-sm text-white/70 md:grid-cols-3'>
        <p>HandyManJa — Jamaica's On-Demand Workforce & Property Services Network.</p>
        <div className='space-y-2'>
          <Link href='/terms'>Terms</Link><br />
          <Link href='/privacy'>Privacy</Link><br />
          <Link href='/faq'>FAQ</Link>
        </div>
        <p>Need a Plumber? Call a Handyman. Need an Electrician? Call a Handyman.</p>
      </div>
    </footer>
  );
}
