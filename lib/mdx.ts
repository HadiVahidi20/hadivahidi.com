import Image from 'next/image';
import Link from 'next/link';

// Define custom MDX components
export const mdxComponents = {
  // Override native elements
  h1: ({ children }: { children: React.ReactNode }) => (
    <h1 className="text-3xl md:text-4xl font-bold mt-8 mb-4">{children}</h1>
  ),
  h2: ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-2xl md:text-3xl font-bold mt-8 mb-4">{children}</h2>
  ),
  h3: ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-xl md:text-2xl font-semibold mt-6 mb-3">{children}</h3>
  ),
  h4: ({ children }: { children: React.ReactNode }) => (
    <h4 className="text-lg md:text-xl font-semibold mt-4 mb-2">{children}</h4>
  ),
  p: ({ children }: { children: React.ReactNode }) => (
    <p className="my-4 leading-relaxed">{children}</p>
  ),
  a: ({ href, children }: { href: string; children: React.ReactNode }) => {
    const isInternalLink = href && href.startsWith('/');
    
    if (isInternalLink) {
      return (
        <Link 
          href={href} 
          className="text-primary hover:text-secondary transition-colors"
        >
          {children}
        </Link>
      );
    }
    
    return (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-primary hover:text-secondary transition-colors"
      >
        {children}
      </a>
    );
  },
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className="my-4 ml-6 list-disc">{children}</ul>
  ),
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol className="my-4 ml-6 list-decimal">{children}</ol>
  ),
  li: ({ children }: { children: React.ReactNode }) => (
    <li className="my-1">{children}</li>
  ),
  blockquote: ({ children }: { children: React.ReactNode }) => (
    <blockquote className="border-l-4 border-primary pl-4 my-4 italic">{children}</blockquote>
  ),
  
  // Code blocks
  pre: ({ children }: { children: React.ReactNode }) => (
    <pre className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 my-6 overflow-x-auto">
      {children}
    </pre>
  ),
  code: ({ children, className }: { children: React.ReactNode; className?: string }) => {
    // If it has a className, it's a code block
    if (className) {
      return (
        <code className={`${className} text-sm`}>
          {children}
        </code>
      );
    }
    
    // If not, it's an inline code
    return (
      <code className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-1.5 py-0.5 rounded-md text-sm">
        {children}
      </code>
    );
  },
  
  // Custom components
  Image: ({ src, alt, width, height }: { src: string; alt: string; width?: number; height?: number }) => (
    <div className="my-6">
      <Image
        src={src}
        alt={alt}
        width={width || 800}
        height={height || 450}
        className="rounded-xl"
      />
      {alt && <div className="text-sm text-gray-500 mt-2 text-center">{alt}</div>}
    </div>
  ),
  
  CalloutBox: ({ title, children, type = 'info' }: { title: string; children: React.ReactNode; type?: 'info' | 'warning' | 'tip' }) => {
    const styles = {
      info: 'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800',
      warning: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800',
      tip: 'bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800',
    };
    
    return (
      <div className={`${styles[type]} border rounded-xl p-4 my-6`}>
        <h4 className="font-semibold text-lg mb-2">{title}</h4>
        <div>{children}</div>
      </div>
    );
  },
  
  CodeSandbox: ({ id }: { id: string }) => (
    <iframe
      src={`https://codesandbox.io/embed/${id}?fontsize=14&hidenavigation=1&theme=dark`}
      className="w-full h-96 border-0 rounded-xl overflow-hidden my-6"
      title="CodeSandbox example"
      allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
      sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
    ></iframe>
  ),
  
  // Tables
  table: ({ children }: { children: React.ReactNode }) => (
    <div className="overflow-x-auto my-6">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }: { children: React.ReactNode }) => (
    <thead className="bg-gray-50 dark:bg-gray-800">{children}</thead>
  ),
  tbody: ({ children }: { children: React.ReactNode }) => (
    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">{children}</tbody>
  ),
  tr: ({ children }: { children: React.ReactNode }) => (
    <tr>{children}</tr>
  ),
  th: ({ children }: { children: React.ReactNode }) => (
    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
      {children}
    </th>
  ),
  td: ({ children }: { children: React.ReactNode }) => (
    <td className="px-6 py-4 whitespace-nowrap text-sm">{children}</td>
  ),
};
