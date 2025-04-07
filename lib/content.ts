import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { BlogPostMeta, ProjectMeta } from '@/types/blog';

const contentDirectory = path.join(process.cwd(), 'content');
const blogDirectory = path.join(contentDirectory, 'blog');
const projectsDirectory = path.join(contentDirectory, 'projects');

export function getBlogPosts(): BlogPostMeta[] {
  if (!fs.existsSync(blogDirectory)) {
    return [];
  }
  
  const fileNames = fs.readdirSync(blogDirectory);
  
  const posts = fileNames
    .filter((fileName) => fileName.endsWith('.mdx'))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx$/, '');
      const filePath = path.join(blogDirectory, fileName);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(fileContents);
      
      return {
        slug,
        title: data.title,
        date: data.date,
        excerpt: data.excerpt,
        coverImage: data.coverImage,
        readingTime: data.readingTime || '5 min read',
        tags: data.tags || [],
      } as BlogPostMeta;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
  return posts;
}

export function getBlogPostBySlug(slug: string) {
  const filePath = path.join(blogDirectory, `${slug}.mdx`);
  
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);
  
  return {
    slug,
    title: data.title,
    date: data.date,
    content,
    excerpt: data.excerpt,
    coverImage: data.coverImage,
    readingTime: data.readingTime || '5 min read',
    tags: data.tags || [],
  };
}

export function getProjects(): ProjectMeta[] {
  if (!fs.existsSync(projectsDirectory)) {
    return [];
  }
  
  const fileNames = fs.readdirSync(projectsDirectory);
  
  const projects = fileNames
    .filter((fileName) => fileName.endsWith('.mdx'))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx$/, '');
      const filePath = path.join(projectsDirectory, fileName);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(fileContents);
      
      return {
        slug,
        title: data.title,
        description: data.description,
        coverImage: data.coverImage,
        tags: data.tags || [],
        role: data.role,
        techStack: data.techStack || [],
        githubLink: data.githubLink,
        demoLink: data.demoLink,
        featured: data.featured || false,
      } as ProjectMeta;
    })
    .sort((a, b) => (a.featured === b.featured ? 0 : a.featured ? -1 : 1));
    
  return projects;
}

export function getProjectBySlug(slug: string) {
  const filePath = path.join(projectsDirectory, `${slug}.mdx`);
  
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);
  
  return {
    slug,
    title: data.title,
    description: data.description,
    content,
    coverImage: data.coverImage,
    tags: data.tags || [],
    role: data.role,
    techStack: data.techStack || [],
    githubLink: data.githubLink,
    demoLink: data.demoLink,
    featured: data.featured || false,
  };
}

export function getFeaturedProjects(count = 3): ProjectMeta[] {
  const projects = getProjects();
  return projects.filter(project => project.featured).slice(0, count);
}
