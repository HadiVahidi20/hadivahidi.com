import emailjs from '@emailjs/browser';

// Initialize EmailJS with your User ID
// This should be called once in your app, typically during initialization
export const initEmailJS = () => {
  emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_USER_ID || '');
};

// Send email using EmailJS
export const sendEmail = async (formData: {
  name: string;
  email: string;
  message: string;
}) => {
  try {
    const response = await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '',
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '',
      {
        from_name: formData.name,
        from_email: formData.email,
        message: formData.message,
      }
    );
    
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error('Error sending email:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
};
