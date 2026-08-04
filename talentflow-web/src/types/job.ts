export interface Job {
  id: string;
  slug?: string;
  title: string;
  description: string;
  location?: string | null;
  employment_type?: string | null;
  work_model?: string | null;
  responsibilities?: string | null;
  requirements?: string | null;
  benefits?: string | null;
  application_email?: string | null;
  application_subject?: string | null;
  deadline?: string | null;
  required_skills?: string | null;
  is_active: boolean;
  created_at?: string | null;
}

export interface JobFormData {
  title: string;
  description: string;
  location?: string;
  employment_type?: string;
  work_model?: string;
  responsibilities?: string;
  requirements?: string;
  benefits?: string;
  application_email?: string;
  application_subject?: string;
  deadline?: string;
  required_skills?: string;
}
