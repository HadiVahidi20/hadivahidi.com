'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Projects', path: '/projects' },
  { label: 'Blog', path: '/blog' },
  { label: 'Resume', path: '/resume' },
];

export const Navigation = ({ className, mobile = false }: { className?: string; mobile?: boolean }) => {
  const pathname = usePathname();

  return (
    <nav className={cn('flex', mobile ? 'flex-col space-y-4' : 'items-center space-x-6', className)}>
      {navItems.map((item) => (
        <Link
          key={item.path}
          href={item.path}
          className={cn(
            'relative px-2 py-1 text-sm font-medium transition-colors hover:text-primary',
            pathname === item.path 
              ? 'text-primary'
              : 'text-gray-600 dark:text-gray-300'
          )}
        >
          {item.label}
          {pathname === item.path && !mobile && (
            <motion.div
              layoutId="navigation-underline"
              className="absolute bottom-0 left-0 h-0.5 w-full bg-primary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </Link>
      ))}
    </nav>
  );
};
