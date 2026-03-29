import { Timestamp } from 'firebase/firestore';

export interface Annotation {
  id: string;
  blueprintId: string;
  authorId: string;
  x: number;
  y: number;
  comment: string;
  createdAt: Timestamp;
  version?: number; // For versioning support
}

export interface UserProfile {
  uid: string;
  email: string;
  role: 'client' | 'admin' | 'pending';
  fullName?: string;
  createdAt: Timestamp;
}

export interface Milestone {
  id: string;
  clientId: string;
  title: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  date?: string; // YYYY-MM-DD
  order: number;
  createdAt: Timestamp;
  duration?: number; // In days, for Gantt chart
  startDate?: string; // YYYY-MM-DD
}

export interface ProjectUpdate {
  id: string;
  clientId: string;
  title: string;
  description: string;
  imageUrl?: string;
  createdAt: Timestamp;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: Timestamp;
  read: boolean;
}

export interface Document {
  id: string;
  clientId: string;
  fileName: string;
  fileType: string;
  fileData: string; // Base64
  uploadedBy: string;
  createdAt: Timestamp;
}

export interface Invoice {
  id: string;
  clientId: string;
  amount: number;
  description: string;
  status: 'unpaid' | 'paid';
  dueDate: string;
  createdAt: Timestamp;
  stripePaymentIntentId?: string;
}

export interface ProjectModel {
  id: string;
  clientId: string;
  title: string;
  modelUrl: string;
  createdAt: Timestamp;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Timestamp;
  type?: 'update' | 'message' | 'document' | 'invoice';
}

export interface Testimonial {
  id: string;
  clientId: string;
  clientName: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: Timestamp;
  projectType: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  createdAt: Timestamp;
}
