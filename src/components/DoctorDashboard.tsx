import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { demoData } from '@/data/demoData';
import { Calendar, Users, FileText, MessageCircle, Video, Clock, CheckCircle, XCircle, Activity, Pill, Camera } from 'lucide-react';
import { MedicineManager } from './MedicineManager';
import { EnhancedVideoCall } from './EnhancedVideoCall';
import { ChatSystem } from './ChatSystem';

export const DoctorDashboard: React.FC = () => {
  const { currentUser } = useApp();
  const [selectedTab, setSelectedTab] = useState<'appointments' | 'patients' | 'confirmations' | 'medicines'>('appointments');
  const [showMedicineManager, setShowMedicineManager] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [pendingAppointments, setPendingAppointments] = useState<string[]>([]);

  const doctorAppointments = demoData.appointments.filter(a => a.doctorId === currentUser?.id);
  const patientIntakes = demoData.intakes;
  const allPatients = demoData.users.filter(u => u.role === 'patient');

  const todayConfirmations = patientIntakes.map(intake => {
    const medicine = demoData.medicines.find(m => m.id === intake.medicineId);
    const patient = demoData.users.find(u => u.id === intake.patientId);
    return {
      ...intake,
      medicine,
      patient
    };
  });

  const stats = {
    totalPatients: allPatients.length,
    todayAppointments: doctorAppointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length,
    confirmedIntakes: patientIntakes.filter(i => i.confirmed).length,
    pendingIntakes: patientIntakes.filter(i => !i.confirmed).length
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome, {currentUser?.name}! 👨‍⚕️</h1>
          <p className="text-muted-foreground">Manage your patients and consultations</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Patients</p>
                  <p className="text-2xl font-bold text-primary">{stats.totalPatients}</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Appointments</p>
                  <p className="text-2xl font-bold text-secondary">{stats.todayAppointments}</p>
                </div>
                <Calendar className="w-8 h-8 text-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Confirmed Intakes</p>
                  <p className="text-2xl font-bold text-success">{stats.confirmedIntakes}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Intakes</p>
                  <p className="text-2xl font-bold text-warning">{stats.pendingIntakes}</p>
                </div>
                <Clock className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <Button
            variant={selectedTab === 'appointments' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('appointments')}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Appointments
          </Button>
          <Button
            variant={selectedTab === 'patients' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('patients')}
          >
            <Users className="w-4 h-4 mr-2" />
            Patients
          </Button>
          <Button
            variant={selectedTab === 'confirmations' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('confirmations')}
          >
            <Activity className="w-4 h-4 mr-2" />
            Medicine Confirmations
          </Button>
          <Button
            variant={selectedTab === 'medicines' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('medicines')}
          >
            <Pill className="w-4 h-4 mr-2" />
            Medicines
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowMedicineManager(true)}
          >
            <Camera className="w-4 h-4 mr-2" />
            Add Medicine
          </Button>
        </div>

        {/* Content based on selected tab */}
        {selectedTab === 'appointments' && (
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Manage your scheduled consultations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {doctorAppointments.map((appointment) => {
                const patient = demoData.users.find(u => u.id === appointment.patientId);
                return (
                  <div key={appointment.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{patient?.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {appointment.date} at {appointment.time} • {appointment.type}
                        </p>
                      </div>
                      <Badge variant={appointment.status === 'scheduled' ? 'default' : 'secondary'}>
                        {appointment.status}
                      </Badge>
                    </div>
                    
                    {appointment.notes && (
                      <p className="text-xs text-muted-foreground mb-3">{appointment.notes}</p>
                    )}
                    
                    <div className="flex gap-2 flex-wrap">
                      {appointment.status === 'pending' && (
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => {
                            // Approve appointment
                            appointment.status = 'scheduled';
                            setPendingAppointments(prev => prev.filter(id => id !== appointment.id));
                          }}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="default"
                        onClick={() => {
                          const patient = demoData.users.find(u => u.id === appointment.patientId);
                          setSelectedPatient(patient);
                          setShowVideoCall(true);
                        }}
                      >
                        <Video className="w-4 h-4 mr-1" />
                        Start Consultation
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          const patient = demoData.users.find(u => u.id === appointment.patientId);
                          setSelectedPatient(patient);
                          setShowChat(true);
                        }}
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Chat
                      </Button>
                      <Button size="sm" variant="outline">
                        <FileText className="w-4 h-4 mr-1" />
                        Prescribe
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {selectedTab === 'patients' && (
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle>Patient List</CardTitle>
              <CardDescription>Manage your registered patients</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {allPatients.map((patient) => (
                <div key={patient.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-lg">{patient.avatar}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold">{patient.name}</h3>
                        <p className="text-sm text-muted-foreground">{patient.email}</p>
                      </div>
                    </div>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  
                  <div className="flex gap-2 flex-wrap">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedPatient(patient);
                        // Show patient history modal (can be implemented later)
                      }}
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      View History
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedPatient(patient);
                        setShowChat(true);
                      }}
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Chat
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedPatient(patient);
                        // Show scheduling modal (can be implemented later)
                      }}
                    >
                      <Calendar className="w-4 h-4 mr-1" />
                      Schedule
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {selectedTab === 'confirmations' && (
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle>Medicine Intake Confirmations</CardTitle>
              <CardDescription>Real-time patient medication compliance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {todayConfirmations.map((confirmation) => (
                <div key={confirmation.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{confirmation.patient?.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {confirmation.medicine?.name} ({confirmation.medicine?.dosage})
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Scheduled: {new Date(confirmation.scheduledTime).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={confirmation.confirmed ? 'default' : 'secondary'}>
                        {confirmation.confirmed ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                        {confirmation.confirmed ? 'Confirmed' : 'Pending'}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1 capitalize">
                        {confirmation.confirmationMethod}
                        {confirmation.confirmationMethod === 'voice' && ' 🎤'}
                      </p>
                    </div>
                  </div>
                  
                  {confirmation.voiceTranscript && (
                    <div className="mt-2 p-2 bg-success/10 rounded text-sm">
                      <span className="text-success font-medium">Voice Confirmation:</span>
                      <br />
                      "{confirmation.voiceTranscript}"
                    </div>
                  )}
                  
                  {confirmation.actualTime && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Taken at: {new Date(confirmation.actualTime).toLocaleString()}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {selectedTab === 'medicines' && (
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle>Medicine Database</CardTitle>
              <CardDescription>Manage your medicine inventory and prescriptions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 mb-4">
                <Button onClick={() => setShowMedicineManager(true)}>
                  <Pill className="w-4 h-4 mr-2" />
                  Manage Medicines
                </Button>
                <Button variant="outline" onClick={() => setShowMedicineManager(true)}>
                  <Camera className="w-4 h-4 mr-2" />
                  Add by Photo
                </Button>
              </div>
              
              <div className="grid gap-4">
                {demoData.medicines.map((medicine) => (
                  <div key={medicine.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Pill className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{medicine.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {medicine.dosage} • {medicine.frequency}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="capitalize">
                        {medicine.category || 'tablet'}
                      </Badge>
                    </div>
                    
                    {medicine.instructions && (
                      <p className="text-xs text-muted-foreground mb-2">
                        <strong>Instructions:</strong> {medicine.instructions}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Modals */}
        <MedicineManager 
          isOpen={showMedicineManager} 
          onClose={() => setShowMedicineManager(false)} 
        />
        
        <EnhancedVideoCall 
          isOpen={showVideoCall} 
          onClose={() => setShowVideoCall(false)}
          participant={selectedPatient}
          isDoctor={true}
        />
        
        <ChatSystem 
          isOpen={showChat} 
          onClose={() => setShowChat(false)}
          participant={selectedPatient}
        />
      </div>
    </div>
  );
};