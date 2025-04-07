import Image from 'next/image';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Me',
  description: 'Learn about Hadi Vahidi, web developer with over a decade of experience',
};

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="heading heading-1 mb-6">About Me</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                I'm a web developer with over 10 years of experience and a formal academic background
                in Software Development from Iran. My journey has taken me from traditional software
                engineering to specialized web development, where I focus on creating elegant,
                user-centered digital experiences.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                My passion lies in combining technical expertise with creative problem-solving to
                build websites and applications that make a meaningful impact.
              </p>
            </div>
            
            <div className="relative h-80 lg:h-96 rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/images/profile.jpg"
                alt="Hadi Vahidi"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Journey Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto">
          <h2 className="heading heading-2 mb-12 text-center">My Journey</h2>
          
          <div className="max-w-3xl mx-auto">
            <div className="space-y-12">
              {/* Timeline Item */}
              <div className="relative pl-8 sm:pl-32 py-6 group">
                <div className="font-medium text-2xl text-primary mb-1 sm:mb-0">Education in Iran</div>
                <div className="flex flex-col sm:flex-row items-start mb-1 group-last:before:hidden before:absolute before:left-2 sm:before:left-0 before:h-full before:px-px before:bg-gray-200 dark:before:bg-gray-800 sm:before:ml-[6.5rem] before:self-start before:-translate-x-1/2 before:translate-y-3 after:absolute after:left-2 sm:after:left-0 after:w-4 after:h-4 after:bg-primary after:border-2 after:box-content after:border-gray-200 dark:after:border-gray-900 after:rounded-full sm:after:ml-[6.5rem] after:-translate-x-1/2 after:translate-y-1.5">
                  <time className="sm:absolute sm:left-0 sm:translate-y-0.5 sm:w-24 text-gray-500 dark:text-gray-400 text-sm">2010-2013</time>
                  <div className="sm:pl-8">
                    <div className="text-gray-700 dark:text-gray-300 mb-2">
                      Bachelor's Degree in Software Development
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      Completed my formal education with a focus on software engineering principles and practices.
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Timeline Item */}
              <div className="relative pl-8 sm:pl-32 py-6 group">
                <div className="font-medium text-2xl text-primary mb-1 sm:mb-0">Early Career</div>
                <div className="flex flex-col sm:flex-row items-start mb-1 group-last:before:hidden before:absolute before:left-2 sm:before:left-0 before:h-full before:px-px before:bg-gray-200 dark:before:bg-gray-800 sm:before:ml-[6.5rem] before:self-start before:-translate-x-1/2 before:translate-y-3 after:absolute after:left-2 sm:after:left-0 after:w-4 after:h-4 after:bg-primary after:border-2 after:box-content after:border-gray-200 dark:after:border-gray-900 after:rounded-full sm:after:ml-[6.5rem] after:-translate-x-1/2 after:translate-y-1.5">
                  <time className="sm:absolute sm:left-0 sm:translate-y-0.5 sm:w-24 text-gray-500 dark:text-gray-400 text-sm">2013-2016</time>
                  <div className="sm:pl-8">
                    <div className="text-gray-700 dark:text-gray-300 mb-2">
                      Software Developer
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      Worked on various software projects, gaining experience in different domains of programming and development.
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Timeline Item */}
              <div className="relative pl-8 sm:pl-32 py-6 group">
                <div className="font-medium text-2xl text-primary mb-1 sm:mb-0">Web Development Focus</div>
                <div className="flex flex-col sm:flex-row items-start mb-1 group-last:before:hidden before:absolute before:left-2 sm:before:left-0 before:h-full before:px-px before:bg-gray-200 dark:before:bg-gray-800 sm:before:ml-[6.5rem] before:self-start before:-translate-x-1/2 before:translate-y-3 after:absolute after:left-2 sm:after:left-0 after:w-4 after:h-4 after:bg-primary after:border-2 after:box-content after:border-gray-200 dark:after:border-gray-900 after:rounded-full sm:after:ml-[6.5rem] after:-translate-x-1/2 after:translate-y-1.5">
                  <time className="sm:absolute sm:left-0 sm:translate-y-0.5 sm:w-24 text-gray-500 dark:text-gray-400 text-sm">2016-2020</time>
                  <div className="sm:pl-8">
                    <div className="text-gray-700 dark:text-gray-300 mb-2">
                      Transition to Web Development
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      Made a conscious shift to specialize in web development, learning modern JavaScript frameworks and best practices.
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Timeline Item */}
              <div className="relative pl-8 sm:pl-32 py-6 group">
                <div className="font-medium text-2xl text-primary mb-1 sm:mb-0">Specialized Expertise</div>
                <div className="flex flex-col sm:flex-row items-start mb-1 group-last:before:hidden before:absolute before:left-2 sm:before:left-0 before:h-full before:px-px before:bg-gray-200 dark:before:bg-gray-800 sm:before:ml-[6.5rem] before:self-start before:-translate-x-1/2 before:translate-y-3 after:absolute after:left-2 sm:after:left-0 after:w-4 after:h-4 after:bg-primary after:border-2 after:box-content after:border-gray-200 dark:after:border-gray-900 after:rounded-full sm:after:ml-[6.5rem] after:-translate-x-1/2 after:translate-y-1.5">
                  <time className="sm:absolute sm:left-0 sm:translate-y-0.5 sm:w-24 text-gray-500 dark:text-gray-400 text-sm">2020-Present</time>
                  <div className="sm:pl-8">
                    <div className="text-gray-700 dark:text-gray-300 mb-2">
                      Full-Stack Web Developer
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      Focused on React and Next.js ecosystem, building responsive, user-centered web applications and delivering over 50 successful projects.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Skills Section */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto">
          <h2 className="heading heading-2 mb-16 text-center">My Skills</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Frontend Skills */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
              <h3 className="text-xl font-semibold mb-6 text-primary">Frontend Development</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700 dark:text-gray-300">React / Next.js</span>
                    <span className="text-gray-600 dark:text-gray-400">95%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700 dark:text-gray-300">TypeScript</span>
                    <span className="text-gray-600 dark:text-gray-400">90%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '90%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700 dark:text-gray-300">HTML5 / CSS3</span>
                    <span className="text-gray-600 dark:text-gray-400">98%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '98%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700 dark:text-gray-300">Tailwind CSS</span>
                    <span className="text-gray-600 dark:text-gray-400">95%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700 dark:text-gray-300">Responsive Design</span>
                    <span className="text-gray-600 dark:text-gray-400">100%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Backend Skills */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
              <h3 className="text-xl font-semibold mb-6 text-primary">Backend Development</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700 dark:text-gray-300">Node.js</span>
                    <span className="text-gray-600 dark:text-gray-400">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700 dark:text-gray-300">Express.js</span>
                    <span className="text-gray-600 dark:text-gray-400">80%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700 dark:text-gray-300">MongoDB</span>
                    <span className="text-gray-600 dark:text-gray-400">75%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700 dark:text-gray-300">PostgreSQL</span>
                    <span className="text-gray-600 dark:text-gray-400">70%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700 dark:text-gray-300">Firebase</span>
                    <span className="text-gray-600 dark:text-gray-400">90%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '90%' }}></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tools & Other Skills */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
              <h3 className="text-xl font-semibold mb-6 text-primary">Tools & Other Skills</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700 dark:text-gray-300">Git / GitHub</span>
                    <span className="text-gray-600 dark:text-gray-400">95%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700 dark:text-gray-300">VS Code</span>
                    <span className="text-gray-600 dark:text-gray-400">100%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700 dark:text-gray-300">Figma</span>
                    <span className="text-gray-600 dark:text-gray-400">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700 dark:text-gray-300">CI/CD</span>
                    <span className="text-gray-600 dark:text-gray-400">80%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700 dark:text-gray-300">Testing (Jest, React Testing Library)</span>
                    <span className="text-gray-600 dark:text-gray-400">75%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Fun Facts Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto">
          <h2 className="heading heading-2 mb-12 text-center">Highlights</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
              <div className="text-5xl font-bold text-primary mb-4">50+</div>
              <div className="text-xl font-semibold mb-2">Web Projects</div>
              <p className="text-gray-600 dark:text-gray-400">
                Successfully delivered over 50 web projects for clients across various industries.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
              <div className="text-5xl font-bold text-primary mb-4">1000+</div>
              <div className="text-xl font-semibold mb-2">Users Helped</div>
              <p className="text-gray-600 dark:text-gray-400">
                Tools built by me have been used by over 1,000 users in humanitarian contexts.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
              <div className="text-5xl font-bold text-primary mb-4">10+</div>
              <div className="text-xl font-semibold mb-2">Years Experience</div>
              <p className="text-gray-600 dark:text-gray-400">
                Over a decade of experience in software development, with specialized focus on web technologies.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
