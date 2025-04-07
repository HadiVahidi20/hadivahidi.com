import { SiteConfig } from '@/types';

export const siteConfig: SiteConfig = {
  name: 'Hadi Vahidi',
  description: 'Personal website of Hadi Vahidi, web developer with over 10 years of experience',
  url: 'https://hadivahidi.com',
  links: {
    twitter: 'https://x.com/placeholder',
    github: 'https://github.com/HadiVahidi20',
    linkedin: 'https://linkedin.com/in/placeholder',
    facebook: 'https://facebook.com/placeholder',
  },
  contact: {
    email: 'hi@hadivahidi.com',
    location: 'London, United Kingdom',
  },
};

export const navItems = [
  {
    title: 'Home',
    href: '/',
  },
  {
    title: 'About',
    href: '/about',
  },
  {
    title: 'Projects',
    href: '/projects',
  },
  {
    title: 'Blog',
    href: '/blog',
  },
  {
    title: 'Resume',
    href: '/resume',
  },
  {
    title: 'Contact',
    href: '/contact',
  },
];
