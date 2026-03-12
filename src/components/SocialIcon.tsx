import React from 'react';
import { 
  Linkedin, 
  Twitter, 
  Instagram, 
  Facebook, 
  Youtube, 
  Globe,
  Mail,
  MessageCircle,
  Share2
} from 'lucide-react';

export interface SocialIconProps {
  platform: string;
  size?: number;
  className?: string;
}

const SocialIcon = ({ platform, size = 18, className = '' }: SocialIconProps) => {
  const normalizedPlatform = (platform || 'globe').toString().toLowerCase();

  const iconMap: Record<string, React.ElementType> = {
    'linkedin': Linkedin,
    'instagram': Instagram,
    'twitter': Twitter,
    'x': Twitter,
    'facebook': Facebook,
    'youtube': Youtube,
    'mail': Mail,
    'whatsapp': MessageCircle,
    'threads': MessageCircle, // Using MessageCircle as a placeholder for Threads if not in Lucide
  };

  // Custom SVGs for platforms not in Lucide or needing specific styling
  if (normalizedPlatform === 'tiktok') {
    return (
      <svg 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        width={size} 
        height={size} 
        className={className}
      >
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
      </svg>
    );
  }

  if (normalizedPlatform === 'threads') {
    return (
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        width={size} 
        height={size} 
        className={className}
      >
        <path d="M12 12c-2.5 0-4.5-2-4.5-4.5S9.5 3 12 3s4.5 2 4.5 4.5M12 15c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6M12 21c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z" />
        <path d="M12 18c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5z" />
      </svg>
    );
  }

  const IconComponent = iconMap[normalizedPlatform] || Globe;
  return <IconComponent size={size} className={className} />;
};

export default SocialIcon;
