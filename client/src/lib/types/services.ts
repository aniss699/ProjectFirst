
export interface ServiceMode {
  id: string;
  title: string;
  description: string;
  emoji: string;
  href: string;
  color: string;
}

export interface FlashDealRequest {
  need: string;
  maxBudget: number;
  maxDelay: string;
  location: string;
  phone?: string;
  email?: string;
}

export interface ReverseSubscriptionRequest {
  need: string;
  frequency: 'weekly' | 'bi-weekly' | 'monthly';
  durationMinutes: number;
  monthlyBudget: number;
  preferredSlot: string;
  location: string;
}

export interface GroupRequest {
  category: string;
  need: string;
  location: string;
  pricePerParticipant: number;
  targetParticipants: number;
  deadline: string;
}

export interface IaHumanRequest {
  description: string;
}

export interface AIDraftBrief {
  scope: string;
  deliverables: string[];
  risks: string[];
  checklist: string[];
}

export interface LiveSlot {
  id: string;
  providerName: string;
  rating: number;
  slot: string;
  duration: number;
  pricePerHour: number;
  distance: number;
  tags: string[];
}

export interface OpportunityFilters {
  category?: string;
  radiusKm?: number;
}
