import { HeroSection } from '@/components/sections/HeroSection';
import { SkillsSection } from '@/components/sections/SkillsSection';
import { FeaturedProjects } from '@/components/sections/FeaturedProjects';
import { getFeaturedProjects } from '@/lib/content';

export const metadata = {
  title: 'Hadi Vahidi | Web Developer',
  description: 'Personal website of Hadi Vahidi, web developer with over 10 years of experience',
};

export default function Home() {
  const featuredProjects = getFeaturedProjects(3);
  
  return (
    <>
      <HeroSection />
      <SkillsSection />
      <FeaturedProjects projects={featuredProjects} />
      
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Let's Create Something Amazing Together
            </h2>
            <p className="text-lg mb-8">
              I'm currently available for freelance projects and full-time opportunities.
              If you're looking for a developer who can bring your ideas to life, let's talk!
            </p>
            <a
              href="/contact"
              className="inline-flex items-center justify-center h-12 px-8 font-medium text-primary bg-white rounded-xl hover:bg-gray-100 transition-colors"
            >
              Get In Touch
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
