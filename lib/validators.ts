import { z } from 'zod';

export const requestSchema = z.object({
  category: z.string().min(2),
  details: z.string().min(8),
  propertyType: z.string(),
  urgency: z.string(),
  parish: z.string(),
  community: z.string().min(2),
  address: z.string().optional(),
  preferredDate: z.string().optional(),
  preferredTimeWindow: z.string().optional(),
  name: z.string().min(2),
  phone: z.string().min(7),
  email: z.string().email().optional().or(z.literal('')),
  preferredContact: z.string(),
  consent: z.boolean().refine(Boolean, 'Consent is required'),
  honeypot: z.string().max(0).optional(),
  attachments: z.array(z.string()).optional()
});

export const workforceSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(7),
  email: z.string().email().optional().or(z.literal('')),
  parish: z.string().min(2),
  skills: z.array(z.string()).min(1),
  yearsExperience: z.string().min(1),
  availability: z.string().min(5),
  transportation: z.boolean(),
  toolsAvailable: z.boolean(),
  references: z.string().min(8),
  honeypot: z.string().max(0).optional(),
  attachments: z.array(z.string()).optional()
});
