'use client';

import { useState, useEffect } from 'react';
import { ProjectCard } from '@/components/cards/ProjectCard';
import { getProjects } from '@/lib/content';
import { ProjectMeta } from '@/types/project';
import { motion } from 'framer-motion';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectMeta[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectMeta[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>('All');
  
  // Get all unique tags from projects
  const allTags = ['All', ...Array.from(new Set(projects.flatMap(project => project.tags)))];
  
  useEffect(() => {
    // Load projects on the client side
    const loadedProjects = getProjects();
    setProjects(loadedProjects);
    setFilteredProjects(loadedProjects);
  }, []);
  
  // Filter projects when tag changes
  useEffect(() => {
    if (selectedTag === 'All') {
      setFilteredProjects(projects);
    } else {
      const filtered = projects.filter(project => project.tags.includes(selectedTag));
      setFilteredProjects(filtered);
    }
  }, [selectedTag, projects]);
  
  return (
    <>
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="heading heading-1 mb-6">My Projects</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Browse through my portfolio of web development projects. Each project represents
              a unique challenge and solution that showcases my skills and approach.
            </p>
          </div>
          
          {/* Filter Tags */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedTag === tag
                    ? 'bg-primary text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>
      
      <section className="py-16">
        <div className="container mx-auto">
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <ProjectCard project={project} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No projects match the selected filter</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try selecting a different category or view all projects.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
