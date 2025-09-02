import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { demoData } from '@/data/demoData';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { Calendar, Clock, Mic, MicOff, Pill, Video, FileText, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const PatientDashboard: React.FC = () => {
  const { currentUser, language } = useApp();
  const { toast } = useToast();
  const [activeIntake, setActiveIntake] = useState<string | null>(null);
  const { isListening, transcript, startListening, stopListening, resetTranscript, supported } = useVoiceRecognition();

  const patientMedicines = demoData.medicines;
  const patientIntakes = demoData.intakes.filter(i => i.patientId === currentUser?.id);
  const patientAppointments = demoData.appointments.filter(a => a.patientId === currentUser?.id);

  const handleVoiceConfirmation = (medicineId: string) => {
    if (!supported) {
      toast({
        title: "Voice not supported",
        description: "Your browser doesn't support voice recognition",
        variant: "destructive"
      });
      return;
    }

    setActiveIntake(medicineId);
    resetTranscript();
    const lang = language === 'hi' ? 'hi-IN' : 'en-US';
    startListening(lang);
    
    // Auto-stop after 5 seconds
    setTimeout(() => {
      if (isListening) {
        stopListening();
        handleConfirmation(medicineId, 'voice', transcript);
      }
    }, 5000);
  };

  const handleButtonConfirmation = (medicineId: string) => {
    handleConfirmation(medicineId, 'button');
  };

  const handleConfirmation = (medicineId: string, method: 'button' | 'voice', voiceText?: string) => {
    // Simulate confirmation logic
    const medicine = patientMedicines.find(m => m.id === medicineId);
    
    toast({
      title: "Medicine Confirmed! ✅",
      description: `${medicine?.name} intake recorded via ${method}${voiceText ? `: "${voiceText}"` : ''}`,
    });
    
    setActiveIntake(null);
    resetTranscript();
  };

  React.useEffect(() => {
    if (transcript && activeIntake && transcript.toLowerCase().includes('medicine')) {
      stopListening();
      handleConfirmation(activeIntake, 'voice', transcript);
    }
  }, [transcript, activeIntake]);

  const todayIntakes = patientMedicines.map(med => ({
    ...med,
    nextDose: med.timing[0],
    confirmed: patientIntakes.some(i => i.medicineId === med.id && i.confirmed)
  }));

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {currentUser?.name}! 👋</h1>
          <p className="text-muted-foreground">Manage your health and medications</p>
        </div>

        {/* Medicine Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-primary" />
                Today's Medications
              </CardTitle>
              <CardDescription>Confirm your medicine intake</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {todayIntakes.map((medicine) => (
                <div key={medicine.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{medicine.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {medicine.dosage} • {medicine.frequency}
                      </p>
                    </div>
                    <Badge variant={medicine.confirmed ? "default" : "secondary"}>
                      <Clock className="w-3 h-3 mr-1" />
                      {medicine.nextDose}
                    </Badge>
                  </div>
                  
                  {medicine.instructions && (
                    <p className="text-xs text-muted-foreground mb-3">{medicine.instructions}</p>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleButtonConfirmation(medicine.id)}
                      size="sm"
                      variant={medicine.confirmed ? "outline" : "default"}
                      disabled={medicine.confirmed}
                    >
                      {medicine.confirmed ? <Check className="w-4 h-4 mr-1" /> : null}
                      {medicine.confirmed ? 'Confirmed' : 'Confirm Intake'}
                    </Button>
                    
                    <Button
                      onClick={() => handleVoiceConfirmation(medicine.id)}
                      size="sm"
                      variant="secondary"
                      disabled={medicine.confirmed || !supported}
                      className={activeIntake === medicine.id && isListening ? 'pulse-voice' : ''}
                    >
                      {activeIntake === medicine.id && isListening ? 
                        <MicOff className="w-4 h-4" /> : 
                        <Mic className="w-4 h-4" />
                      }
                    </Button>
                  </div>
                  
                  {activeIntake === medicine.id && isListening && (
                    <div className="mt-2 p-2 bg-primary/10 rounded text-sm">
                      🎤 Listening... Say "I have taken my medicine"
                      {transcript && <div className="mt-1 text-primary">"{transcript}"</div>}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-secondary" />
                Upcoming Appointments
              </CardTitle>
              <CardDescription>Your scheduled consultations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {patientAppointments.map((appointment) => {
                const doctor = demoData.users.find(u => u.id === appointment.doctorId);
                return (
                  <div key={appointment.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{doctor?.name}</h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {appointment.type} • {appointment.date} at {appointment.time}
                        </p>
                      </div>
                      <Badge variant="outline">{appointment.status}</Badge>
                    </div>
                    
                    {appointment.notes && (
                      <p className="text-xs text-muted-foreground mb-3">{appointment.notes}</p>
                    )}
                    
                    <Button size="sm" variant="outline">
                      <Video className="w-4 h-4 mr-1" />
                      Join Consultation
                    </Button>
                  </div>
                );
              })}
              
              <Button className="w-full" variant="secondary">
                <Calendar className="w-4 h-4 mr-2" />
                Book New Appointment
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="card-shadow hover:medical-shadow transition-smooth cursor-pointer">
            <CardContent className="p-6 text-center">
              <FileText className="w-8 h-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold mb-1">Prescriptions</h3>
              <p className="text-sm text-muted-foreground">View your medical history</p>
            </CardContent>
          </Card>
          
          <Card className="card-shadow hover:medical-shadow transition-smooth cursor-pointer">
            <CardContent className="p-6 text-center">
              <Video className="w-8 h-8 mx-auto mb-2 text-secondary" />
              <h3 className="font-semibold mb-1">Telemedicine</h3>
              <p className="text-sm text-muted-foreground">Video consultations</p>
            </CardContent>
          </Card>
          
          <Card className="card-shadow hover:medical-shadow transition-smooth cursor-pointer">
            <CardContent className="p-6 text-center">
              <Pill className="w-8 h-8 mx-auto mb-2 text-warning" />
              <h3 className="font-semibold mb-1">Medication Log</h3>
              <p className="text-sm text-muted-foreground">Track your intake history</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};