
import { z } from 'zod';

export const flashDealSchema = z.object({
  need: z.string().min(10, 'Le besoin doit faire au moins 10 caractères'),
  maxBudget: z.number().min(1, 'Le budget doit être supérieur à 0'),
  maxDelay: z.string().min(1, 'Veuillez sélectionner un délai'),
  location: z.string().min(1, 'La localisation est requise'),
  phone: z.string().optional(),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
});

export const reverseSubscriptionSchema = z.object({
  need: z.string().min(10, 'Le besoin doit faire au moins 10 caractères'),
  frequency: z.enum(['weekly', 'bi-weekly', 'monthly'], {
    errorMap: () => ({ message: 'Veuillez sélectionner une fréquence' })
  }),
  durationMinutes: z.number().min(15, 'La durée doit être d\'au moins 15 minutes'),
  monthlyBudget: z.number().min(1, 'Le budget doit être supérieur à 0'),
  preferredSlot: z.string().min(1, 'Veuillez sélectionner un créneau'),
  location: z.string().min(1, 'La localisation est requise'),
});

export const groupRequestSchema = z.object({
  category: z.string().min(1, 'Veuillez sélectionner une catégorie'),
  need: z.string().min(10, 'Le besoin doit faire au moins 10 caractères'),
  location: z.string().min(1, 'La localisation est requise'),
  pricePerParticipant: z.number().min(1, 'Le prix par participant doit être supérieur à 0'),
  targetParticipants: z.number().min(2, 'Au minimum 2 participants requis'),
  deadline: z.string().min(1, 'Veuillez sélectionner une date limite'),
});

export const iaHumanSchema = z.object({
  description: z.string().min(20, 'La description doit faire au moins 20 caractères'),
});

export type FlashDealFormData = z.infer<typeof flashDealSchema>;
export type ReverseSubscriptionFormData = z.infer<typeof reverseSubscriptionSchema>;
export type GroupRequestFormData = z.infer<typeof groupRequestSchema>;
export type IaHumanFormData = z.infer<typeof iaHumanSchema>;
