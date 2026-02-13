import { env } from './env';

export function createWhatsAppLink(params: { category: string; parish: string; urgency: string; referenceId: string }) {
  const message = `Hi HandyManJa. I submitted a request (${params.referenceId}). Service: ${params.category}, Parish: ${params.parish}, Urgency: ${params.urgency}.`;
  return `https://wa.me/${env.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
