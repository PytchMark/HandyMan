import { cn } from '@/lib/utils';

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn('rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs', className)} {...props} />;
}
