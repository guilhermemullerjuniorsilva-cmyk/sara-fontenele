
export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  price?: string;
  image: string;
  duration?: number; // Duration in minutes
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  image: string;
}

export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: number;
}

export interface SocialLinks {
  facebook: string;
  instagram: string;
  twitter: string;
}

export interface SchedulingConfig {
  startHour: string; // "08:00"
  endHour: string;   // "18:00"
  breakStartHour?: string; // "12:00" - Início do intervalo
  breakEndHour?: string;   // "14:00" - Fim do intervalo
  intervalMinutes: number; // e.g., 30, 45, 60
  workingDays: number[]; // 0=Sunday, 1=Monday, etc.
  blockedDates: string[]; // ISO Date strings "YYYY-MM-DD"
}

export interface Appointment {
  id: string;
  userId?: string; // Link to registered user
  customerName: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  notes?: string; // Observações feitas pelo cliente
  createdAt: number;
  status: 'pending' | 'confirmed' | 'cancelled';
}

// Prontuário Podológico
export interface MedicalRecord {
  id: string;
  userId?: string; // Link to registered user (if they filled it themselves)
  patientName: string;
  patientPhone: string;
  birthDate: string;
  occupation?: string;
  
  // Anamnese (Histórico de Saúde)
  anamnesis: {
    diabetes: boolean;
    diabetesType?: string; // Tipo 1, 2, Gestacional
    hypertension: boolean; // Hipertensão
    circulatoryProblems: boolean;
    anticoagulants: boolean; // Importante para procedimentos cortantes
    allergies: string; // Medicamentos, látex, iodo
    medications: string; // Uso contínuo
    sensitiveFeet: boolean;
    pacemaker: boolean; // Marcapasso
    hepatitis: boolean;
    oncologicalHistory: boolean;
    // Novos campos adicionados
    smoker: boolean; // Tabagismo
    pregnant: boolean; // Gestante
    psoriasis: boolean; // Psoríase
    osteoporosis: boolean; // Osteoporose
    renalProblems: boolean; // Problemas Renais
    epilepsy: boolean; // Epilepsia
  };

  // Avaliação Podal
  assessment: {
    mainComplaint: string; // Queixa principal
    footType: 'G' | 'P' | 'C' | 'N'; // Grego, Polinésio, Celtico, Normal (Simplificado)
    skinTexture: string; // Hidratada, Anidrose, Bromidrose
    nailCharacteristics: string; // Espessas, Normais, Fracas
    lesions: string; // Calos, Verrugas, Fissuras
  };

  // Registro do Procedimento (Evolução)
  procedureNotes: string;
  homeCareRecommendations: string; // Cuidados em casa
  
  lastUpdate: number;
}

// Auth User Interface
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password: string; // In a real app, this would be hashed
  role: 'admin' | 'client';
}

// Data types for the CMS/Admin
export interface SiteContent {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  whatsappNumber: string; // raw number for api
  socialLinks: SocialLinks;
  
  // Hero Section
  heroTitle: string;
  heroSubtitle: string;
  heroButtonText: string;
  heroNotificationText: string; // Notification badge text
  heroImage: string; // Nova imagem editável

  // About Section
  aboutImage: string; // Nova imagem editável

  themeColor: string; // Primary hex color
  services: ServiceItem[];
  testimonials: Testimonial[]; // Nova lista de depoimentos editável
  openingHoursText: string; // Text displayed in contact section
  schedulingConfig: SchedulingConfig; // New robust scheduling config
  
  // Configuração Supabase
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}
