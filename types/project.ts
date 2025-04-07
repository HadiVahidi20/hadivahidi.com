export interface Project {
  slug: string;
  title: string;
  description: string;
  content: string;
  coverImage: string;
  tags: string[];
  role: string;
  techStack: string[];
  githubLink?: string;
  demoLink?: string;
  featured: boolean;
}

export interface ProjectMeta {
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  tags: string[];
  role: string;
  techStack: string[];
  githubLink?: string;
  demoLink?: string;
  featured: boolean;
}
