import { DemoData } from '@/types';

export const demoData: DemoData = {
  users: [
    {
      id: 'patient-1',
      name: 'Sarah Johnson',
      email: 'patient@mediminder.com',
      role: 'patient',
      language: 'en',
      avatar: '👩‍💼'
    },
    {
      id: 'doctor-1', 
      name: 'Dr. Rajesh Kumar',
      email: 'doctor@mediminder.com',
      role: 'doctor',
      language: 'en',
      avatar: '👨‍⚕️'
    },
    {
      id: 'admin-1',
      name: 'Admin User',
      email: 'admin@mediminder.com', 
      role: 'admin',
      language: 'en',
      avatar: '👤'
    }
  ],
  medicines: [
    {
      id: 'med-1',
      name: 'Aspirin',
      dosage: '100mg',
      frequency: 'Once daily',
      timing: ['09:00'],
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      instructions: 'Take with food'
    },
    {
      id: 'med-2', 
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily',
      timing: ['08:00', '20:00'],
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      instructions: 'Take before meals'
    },
    {
      id: 'med-3',
      name: 'Vitamin D3',
      dosage: '1000 IU',
      frequency: 'Once daily',
      timing: ['08:00'],
      startDate: '2024-01-01',
      endDate: '2024-06-30',
      instructions: 'Take with breakfast'
    }
  ],
  intakes: [
    {
      id: 'intake-1',
      medicineId: 'med-1',
      patientId: 'patient-1',
      scheduledTime: '2024-01-15T09:00:00Z',
      actualTime: '2024-01-15T09:05:00Z',
      confirmed: true,
      confirmationMethod: 'voice',
      voiceTranscript: 'I have taken my medicine'
    },
    {
      id: 'intake-2',
      medicineId: 'med-2',
      patientId: 'patient-1', 
      scheduledTime: '2024-01-15T08:00:00Z',
      confirmed: false,
      confirmationMethod: 'button'
    }
  ],
  appointments: [
    {
      id: 'apt-1',
      patientId: 'patient-1',
      doctorId: 'doctor-1',
      date: '2024-01-20',
      time: '10:00',
      status: 'scheduled',
      type: 'consultation',
      notes: 'Regular checkup'
    },
    {
      id: 'apt-2',
      patientId: 'patient-1',
      doctorId: 'doctor-1',
      date: '2024-01-25',
      time: '14:30',
      status: 'scheduled', 
      type: 'follow-up',
      notes: 'Follow up on medication adjustments'
    }
  ]
};