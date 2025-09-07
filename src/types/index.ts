export type UserRole = 'patient' | 'doctor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  language: 'en' | 'hi' | 'kn' | 'ml' | 'ur' | 'tcy' | 'ta' | 'mr' | 'te';
  avatar?: string;
}

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  timing: string[];
  startDate: string;
  endDate: string;
  instructions?: string;
  category?: string;
  sideEffects?: string;
}

export interface MedicineIntake {
  id: string;
  medicineId: string;
  patientId: string;
  scheduledTime: string;
  actualTime?: string;
  confirmed: boolean;
  confirmationMethod: 'button' | 'voice';
  voiceTranscript?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'pending';
  type: 'consultation' | 'follow-up' | 'emergency';
  notes?: string;
}

export interface DemoData {
  users: User[];
  medicines: Medicine[];
  intakes: MedicineIntake[];
  appointments: Appointment[];
}