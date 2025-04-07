declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_EMAILJS_USER_ID: string;
    NEXT_PUBLIC_EMAILJS_SERVICE_ID: string;
    NEXT_PUBLIC_EMAILJS_TEMPLATE_ID: string;
    
    // Add other environment variables as needed
    NODE_ENV: 'development' | 'production' | 'test';
  }
}
