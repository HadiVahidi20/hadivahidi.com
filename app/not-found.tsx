'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-9xl font-bold text-primary">404</h1>
          
          <h2 className="mt-8 text-2xl font-semibold">
            Oops, you found a broken link.
          </h2>
          
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Let's get you back on track. The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="mt-8">
            <Button asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
