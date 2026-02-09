
export type CampaignStatus = 'draft' | 'scheduled' | 'sent';

export interface SocialLink {
  platform: 'facebook' | 'instagram' | 'linkedin' | 'twitter' | 'youtube';
  url: string;
}

export interface Campaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  status: CampaignStatus;
  sentAt?: string;
  recipientsCount: number;
  contacts?: string[];
  stats?: {
    opens: number;
    clicks: number;
  };
  // Novos campos para layout rico
  imageUrl?: string;
  ctaText?: string;
  ctaUrl?: string;
  socialLinks?: SocialLink[];
}

export interface Contact {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  tags: string[];
  status: 'subscribed' | 'unsubscribed';
  addedAt: string;
}

export interface DashboardStats {
  totalSubscribers: number;
  avgOpenRate: number;
  avgClickRate: number;
  campaignsSent: number;
}
