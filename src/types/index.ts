export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'client';
  organization?: string;
  phone?: string;
  password_hash?: string;
  created_at: string;
}

export interface ClientProject {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_organization?: string;
  user_phone?: string;
  title: string;
  category: string;
  description: string;
  specifications?: string;
  target_timeline?: string;
  estimated_budget?: string;
  reference_file_url?: string;
  status: 'Under Review' | 'Approved' | 'In Development' | 'Testing & Validation' | 'Completed' | 'Declined';
  admin_notes?: string;
  is_published_to_portfolio?: boolean;
  created_at: string;
  updated_at: string;
}

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
