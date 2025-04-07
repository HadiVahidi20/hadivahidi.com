import Link from 'next/link';
import { Metadata } from 'next';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Resume',
  description: 'Hadi Vahidi - Web Developer Resume with 10+ years of experience',
};

export default function ResumePage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
          {/* Resume Header */}
          <div className="p-8 md:p-12 bg-primary text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Hadi Vahidi</h1>
                <p className="text-xl opacity-90">Web Developer</p>
              </div>
              
              <Button asChild className="bg-white text-primary hover:bg-gray-100">
                <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PDF
                </a>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-sm md:text-base">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>hi@hadivahidi.com</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>hadivahidi.com</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>London, United Kingdom</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <a 
                  href="https://github.com/HadiVahidi20" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  github.com/HadiVahidi20
                </a>
              </div>
            </div>
          </div>
          
          {/* Resume Content */}
          <div className="p-8 md:p-12">
            {/* Summary Section */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white border-b pb-2">Professional Summary</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Web developer with 10+ years of experience specializing in front-end and full-stack development.
                Proficient in React, Next.js, TypeScript, and modern JavaScript frameworks with a focus on
                creating responsive, accessible, and performance-optimized web applications. Passionate about
                clean code, user-centered design, and creating impactful digital experiences.
              </p>
            </section>
            
            {/* Skills Section */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white border-b pb-2">Technical Skills</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-white">Frontend Development</h3>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                    <li>React, Next.js, React Router, React Query</li>
                    <li>TypeScript, JavaScript (ES6+)</li>
                    <li>HTML5, CSS3, Tailwind CSS, Styled Components</li>
                    <li>Redux, Context API, Recoil</li>
                    <li>Responsive & Mobile-First Design</li>
                    <li>Web Accessibility (WCAG)</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-white">Backend & Other</h3>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                    <li>Node.js, Express</li>
                    <li>Firebase, MongoDB, SQL</li>
                    <li>RESTful APIs, GraphQL</li>
                    <li>Git, GitHub, GitLab</li>
                    <li>Jest, React Testing Library</li>
                    <li>CI/CD, Docker</li>
                  </ul>
                </div>
              </div>
            </section>
            
            {/* Experience Section */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white border-b pb-2">Professional Experience</h2>
              
              {/* Job Entry */}
              <div className="mb-8">
                <div className="flex flex-col md:flex-row justify-between mb-2">
                  <h3 className="font-semibold text-lg text-gray-800 dark:text-white">Senior Frontend Developer</h3>
                  <div className="text-gray-600 dark:text-gray-400 md:text-right">
                    <div>Freelance Consultant</div>
                    <div>2020 - Present</div>
                  </div>
                </div>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                  <li>Developed and maintained multiple client websites and applications using React, Next.js, and Tailwind CSS.</li>
                  <li>Built custom e-commerce solutions and content management systems with headless CMS integrations.</li>
                  <li>Implemented responsive designs and ensured cross-browser compatibility and accessibility compliance.</li>
                  <li>Improved website performance by optimizing assets, implementing lazy loading, and leveraging modern build tools.</li>
                  <li>Collaborated with UI/UX designers to transform wireframes and mockups into fully functional interfaces.</li>
                </ul>
              </div>
              
              {/* Job Entry */}
              <div className="mb-8">
                <div className="flex flex-col md:flex-row justify-between mb-2">
                  <h3 className="font-semibold text-lg text-gray-800 dark:text-white">Frontend Developer</h3>
                  <div className="text-gray-600 dark:text-gray-400 md:text-right">
                    <div>Digital Agency (Placeholder)</div>
                    <div>2016 - 2020</div>
                  </div>
                </div>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                  <li>Developed responsive websites and applications for various clients across multiple industries.</li>
                  <li>Collaborated with a team of developers, designers, and project managers in an Agile environment.</li>
                  <li>Implemented modern JavaScript frameworks and libraries to enhance user experiences.</li>
                  <li>Optimized web applications for maximum speed and scalability.</li>
                  <li>Conducted code reviews and mentored junior developers.</li>
                </ul>
              </div>
              
              {/* Job Entry */}
              <div className="mb-8">
                <div className="flex flex-col md:flex-row justify-between mb-2">
                  <h3 className="font-semibold text-lg text-gray-800 dark:text-white">Software Developer</h3>
                  <div className="text-gray-600 dark:text-gray-400 md:text-right">
                    <div>Tech Solutions Company (Placeholder)</div>
                    <div>2013 - 2016</div>
                  </div>
                </div>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                  <li>Developed and maintained desktop and web applications using various programming languages.</li>
                  <li>Worked on database design and integration with application layers.</li>
                  <li>Participated in full software development lifecycle from requirements gathering to deployment.</li>
                  <li>Collaborated with QA team to identify and fix bugs and performance issues.</li>
                </ul>
              </div>
            </section>
            
            {/* Education Section */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white border-b pb-2">Education</h2>
              
              <div className="flex flex-col md:flex-row justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 dark:text-white">Bachelor of Science in Software Development</h3>
                  <div className="text-gray-700 dark:text-gray-300">University Name (Iran)</div>
                </div>
                <div className="text-gray-600 dark:text-gray-400 md:text-right">
                  <div>2010 - 2013</div>
                </div>
              </div>
            </section>
            
            {/* Tools Section */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white border-b pb-2">Tools I Use</h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                <div className="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">VS Code</span>
                </div>
                <div className="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Git</span>
                </div>
                <div className="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">GitHub</span>
                </div>
                <div className="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Figma</span>
                </div>
                <div className="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Postman</span>
                </div>
                <div className="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">npm/yarn</span>
                </div>
                <div className="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Webpack</span>
                </div>
                <div className="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Chrome DevTools</span>
                </div>
              </div>
            </section>
            
            {/* Languages Section */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white border-b pb-2">Languages</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700 dark:text-gray-300">English</span>
                    <span className="text-gray-600 dark:text-gray-400">Fluent</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '90%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700 dark:text-gray-300">Persian (Farsi)</span>
                    <span className="text-gray-600 dark:text-gray-400">Native</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Want to learn more about my work or discuss potential opportunities?
          </p>
          <Button asChild>
            <Link href="/contact">Get in Touch</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
