export interface FounderAchievement {
  stat: string;
  label: string;
}

export interface FounderData {
  name: string;
  handle: string;
  role: string;
  bio: string;
  storyHighlights: string[];
  photoUrl: string;
  location: string;
  achievements: FounderAchievement[];
  quote: string;
}

export interface ShowcaseItem {
  id: string;
  title: string;
  subtitle?: string;
  category?: string;
  imageUrl: string;
  date?: string;
  caption?: string;
}

export interface SiteConfig {
  telegramLink: string;
  channelName: string;
  activeMembersCount: number;
  remainingInvites: number;
  heroHeadline: string;
  heroSubheadline: string;
  videoUrl: string;
  videoPoster?: string;
  videoTitle: string;
  videoDescription: string;
  founder: FounderData;
  showcase?: ShowcaseItem[];
}
