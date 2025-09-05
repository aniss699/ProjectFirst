
export interface Profile {
  id: string;
  userId: string;
  name: string;
  email: string;
  type: 'client' | 'provider';
  avatar?: string;
  bio?: string;
  location?: string;
  skills?: string[];
  keywords?: string[];
  hourlyRate?: number;
  availability?: string;
  portfolio?: PortfolioItem[];
  certifications?: Certification[];
  reviews?: Review[];
  completeness?: number;
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  projectUrl?: string;
  technologies?: string[];
  completedAt: Date;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialUrl?: string;
}

export interface Review {
  id: string;
  clientId: string;
  clientName: string;
  rating: number;
  comment: string;
  projectTitle?: string;
  createdAt: Date;
}

export interface ProfileFormData {
  name: string;
  bio: string;
  location: string;
  skills: string[];
  keywords: string[];
  hourlyRate?: number;
  availability: string;
}

export interface ProfileStats {
  completeness: number;
  totalProjects: number;
  averageRating: number;
  responseTime: string;
  skillsCount: number;
}
