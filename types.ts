
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  cvsGenerated: number;
  jobsApplied: number;
  plan: 'free' | 'premium';
}

export interface JobApplication {
  id: string;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  createdAt: string;
}

export interface GeneratedAsset {
  id: string;
  type: 'cover_letter' | 'resume_summary';
  content: string; // Used for the raw text or title
  pdfData?: string; // Base64 string of the PDF for history retrieval
  jobTitle: string;
  companyName: string;
  date: string;
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
}
