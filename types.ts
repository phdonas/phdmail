
export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'queued';

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
  createdAt?: string; // Changed from 'any' to 'string' to reflect ISO string format
  sentAt?: string;
  recipientsCount: number;
  contacts?: string[];
  segmentType?: 'all' | 'tags' | 'csv';
  segmentTags?: string[];
  stats?: {
    opens: number;
    clicks: number;
  };
  // Novos campos para layout rico
  imageUrl?: string;
  imageLink?: string;
  ctaText?: string;
  ctaUrl?: string;
  socialLinks?: SocialLink[];
  scheduledFor?: string;

  // New Footer Fields
  topic?: string;
  footerText?: string;
  footerLinkText?: string;
  footerLinkUrl?: string;
  footerButtonText?: string;
  footerButtonUrl?: string;
  footerImageUrl?: string;
  footerImageLink?: string;

  failedResults?: Array<{
    email: string;
    error: string;
    timestamp: any;
  }>;

  // Progress Tracking
  sentCount?: number;
  failedCount?: number;
  totalRecipients?: number;
  isTest?: boolean;
  sections?: EmailSection[];
  bgColor?: string;
  containerBgColor?: string;
  textColor?: string;
  fontFamily?: string;
}

export interface LinkItem {
  id: string;
  name: string;
  url: string;
  archived?: boolean;
}

export type EmailBlockType = 'text' | 'video' | 'image' | 'cta' | 'divider';

export interface EmailBlock {
  id: string;
  type: EmailBlockType;
  content?: string;
  imageUrl?: string;
  imageLink?: string;
  videoUrl?: string;
  ctaText?: string;
  ctaUrl?: string;
  ctaAlign?: 'left' | 'center' | 'right';
  ctaBgColor?: string;
  ctaTextColor?: string;
  spacing?: number;
}

export interface EmailSection {
  id: string;
  bgColor: string;
  textColor: string;
  padding?: 'small' | 'medium' | 'large';
  blocks: EmailBlock[];
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
