export interface Project {
  id: string;
  title: string;
  slug?: string;
  category: string;
  summary: string;
  description?: string;
  client?: string;
  technologies: string[];
  features: string[];
  image_url?: string;
  status: 'Completed' | 'In Progress' | 'Prototyped';
  featured?: boolean;
  completion_date?: string;
  demo_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  service?: string;
  message: string;
  status?: 'New' | 'Contacted' | 'Closed';
  created_at?: string;
}
