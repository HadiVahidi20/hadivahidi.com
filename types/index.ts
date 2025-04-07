// Export all types from the project
export * from './blog';
export * from './project';

// Common types used across the project
export type SiteConfig = {
  name: string;
  description: string;
  url: string;
  links: {
    twitter: string;
    github: string;
    linkedin: string;
    facebook: string;
  };
  contact: {
    email: string;
    location: string;
  };
};

export type NavItem = {
  title: string;
  href: string;
  external?: boolean;
};

export type SocialLink = {
  name: string;
  url: string;
  icon: React.ReactNode;
};
