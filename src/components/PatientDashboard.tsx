import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { demoData } from '@/data/demoData';
import { useAdvancedVoiceRecognition } from '@/hooks/useAdvancedVoiceRecognition';
import { Calendar, Clock, Mic, MicOff, Pill, Video, FileText, Check, X, Upload, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AppointmentBooking } from './AppointmentBooking';
import { VideoCall } from './VideoCall';
import { PrescriptionUpload } from './PrescriptionUpload';
import { useTranslation } from '@/utils/i18n';

export const PatientDashboard: React.FC = () => {
  const { currentUser, language } = useApp();
  const { t } = useTranslation(language);
  const { toast } = useToast();
  const [activeIntake, setActiveIntake] = useState<string | null>(null);
  const [showAppointmentBooking, setShowAppointmentBooking] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showPrescriptionUpload, setShowPrescriptionUpload] = useState(false);
  const [confirmedMedicines, setConfirmedMedicines] = useState<Set<string>>(new Set());
  const { isListening, transcript, startListening, stopListening, resetTranscript, supported } = useAdvancedVoiceRecognition();

  const patientMedicines = demoData.medicines;
  const patientIntakes = demoData.intakes.filter(i => i.patientId === currentUser?.id);
  const patientAppointments = demoData.appointments.filter(a => a.patientId === currentUser?.id);

  const getLanguageCode = (lang: string) => {
    const langMap: Record<string, string> = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'kn': 'kn-IN',
      'ml': 'ml-IN',
      'ur': 'ur-PK',
      'tcy': 'kn-IN', // Use Kannada for Tulu
      'ta': 'ta-IN',
      'mr': 'mr-IN',
      'te': 'te-IN'
    };
    return langMap[lang] || 'en-US';
  };

  const handleVoiceConfirmation = (medicineId: string) => {
    if (!supported) {
      toast({
        title: t('voice_not_supported'),
        description: t('voice_not_supported_desc'),
        variant: "destructive"
      });
      return;
    }

    setActiveIntake(medicineId);
    resetTranscript();
    const langCode = getLanguageCode(language);
    startListening(langCode);
    
    // Auto-stop after 10 seconds
    setTimeout(() => {
      if (isListening) {
        stopListening();
        if (transcript) {
          handleConfirmation(medicineId, 'voice', transcript);
        }
      }
    }, 10000);
  };

  const handleButtonConfirmation = (medicineId: string) => {
    handleConfirmation(medicineId, 'button');
  };

  const handleConfirmation = (medicineId: string, method: 'button' | 'voice', voiceText?: string) => {
    const medicine = patientMedicines.find(m => m.id === medicineId);
    
    // Mark medicine as confirmed
    setConfirmedMedicines(prev => new Set([...prev, medicineId]));
    
    // Update demo data
    const existingIntake = demoData.intakes.find(i => i.medicineId === medicineId && i.patientId === currentUser?.id);
    if (existingIntake) {
      existingIntake.confirmed = true;
      existingIntake.confirmationMethod = method;
      existingIntake.voiceTranscript = voiceText;
      existingIntake.actualTime = new Date().toISOString();
    } else {
      demoData.intakes.push({
        id: `intake-${Date.now()}`,
        patientId: currentUser?.id || '',
        medicineId,
        scheduledTime: new Date().toISOString(),
        confirmed: true,
        confirmationMethod: method,
        voiceTranscript: voiceText,
        actualTime: new Date().toISOString()
      });
    }
    
    toast({
      title: t('medicine_confirmed'),
      description: `${medicine?.name} ${t('intake_recorded')} ${method}${voiceText ? `: "${voiceText}"` : ''}`,
    });
    
    setActiveIntake(null);
    resetTranscript();
  };

  React.useEffect(() => {
    if (transcript && activeIntake) {
      // Enhanced voice recognition patterns for multiple confirmations
      const confirmationPatterns = [
        /\b(i\s*(have|took|taken|had|consumed|swallowed|drank|ingested|used))\b/i,
        /\b(took|taken|had|consumed|swallowed|drank|ingested|used)\s*(my|the)?\s*(medicine|medication|pill|tablet|drug|dose)\b/i,
        /\b(medicine|medication|pill|tablet|drug|dose)\s*(taken|consumed|swallowed|ingested|done)\b/i,
        /\b(done|finished|completed)\s*(with)?\s*(my|the)?\s*(medicine|medication|pill|tablet)\b/i,
        /\b(yes|yeah|yep|confirmed|confirm|done|finished|taken|ok|okay)\b/i,
        // Hindi patterns
        /\b(मैंने|मैने)\s*(ली|लिया|खाई|खाया|पिया|सेवन|लगाई)\b/i,
        /\b(दवा|दवाई|गोली|टेबलेट|कैप्सूल)\s*(ली|लिया|खाई|खाया|पिया|सेवन)\b/i,
        /\b(हाँ|हा|जी|ठीक|हो\s*गया|पूरा|दवा\s*ली)\b/i,
      ];
      
      const isConfirmation = confirmationPatterns.some(pattern => pattern.test(transcript));
      
      if (isConfirmation) {
        stopListening();
        handleConfirmation(activeIntake, 'voice', transcript);
      }
    }
  }, [transcript, activeIntake]);

  const todayIntakes = patientMedicines.map(med => ({
    ...med,
    nextDose: med.timing[0],
    confirmed: confirmedMedicines.has(med.id) || patientIntakes.some(i => i.medicineId === med.id && i.confirmed)
  }));

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('welcome_back')}, {currentUser?.name}! 👋</h1>
          <p className="text-muted-foreground">{t('manage_health')}</p>
        </div>

        {/* Medicine Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-primary" />
                {t('todays_medications')}
              </CardTitle>
              <CardDescription>{t('confirm_medicine_intake')}</CardDescription>
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
                  
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      onClick={() => handleButtonConfirmation(medicine.id)}
                      size="sm"
                      variant={medicine.confirmed ? "outline" : "default"}
                      disabled={medicine.confirmed}
                    >
                      {medicine.confirmed ? <Check className="w-4 h-4 mr-1" /> : null}
                      {medicine.confirmed ? t('confirmed') : t('confirm_intake')}
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
                    
                    <Button
                      onClick={() => setShowPrescriptionUpload(true)}
                      size="sm"
                      variant="outline"
                    >
                      <Upload className="w-4 h-4 mr-1" />
                      {t('upload_prescription')}
                    </Button>
                  </div>
                  
                  {activeIntake === medicine.id && isListening && (
                    <div className="mt-2 p-2 bg-primary/10 rounded text-sm">
                      🎤 {t('listening')}... {t('say_taken_medicine')}
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
                {t('upcoming_appointments')}
              </CardTitle>
              <CardDescription>{t('scheduled_consultations')}</CardDescription>
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
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setShowVideoCall(true)}
                    >
                      <Video className="w-4 h-4 mr-1" />
                      {t('join_consultation')}
                    </Button>
                  </div>
                );
              })}
              
              <Button 
                className="w-full" 
                variant="secondary"
                onClick={() => setShowAppointmentBooking(true)}
              >
                <Calendar className="w-4 h-4 mr-2" />
                {t('book_new_appointment')}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card 
            className="card-shadow hover:medical-shadow transition-smooth cursor-pointer"
            onClick={() => setShowPrescriptionUpload(true)}
          >
            <CardContent className="p-6 text-center">
              <FileText className="w-8 h-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold mb-1">{t('prescriptions')}</h3>
              <p className="text-sm text-muted-foreground">{t('view_medical_history')}</p>
            </CardContent>
          </Card>
          
          <Card 
            className="card-shadow hover:medical-shadow transition-smooth cursor-pointer"
            onClick={() => setShowVideoCall(true)}
          >
            <CardContent className="p-6 text-center">
              <Video className="w-8 h-8 mx-auto mb-2 text-secondary" />
              <h3 className="font-semibold mb-1">{t('telemedicine')}</h3>
              <p className="text-sm text-muted-foreground">{t('video_consultations')}</p>
            </CardContent>
          </Card>
          
          <Card className="card-shadow hover:medical-shadow transition-smooth cursor-pointer">
            <CardContent className="p-6 text-center">
              <Pill className="w-8 h-8 mx-auto mb-2 text-warning" />
              <h3 className="font-semibold mb-1">{t('medication_log')}</h3>
              <p className="text-sm text-muted-foreground">{t('track_intake_history')}</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Modals */}
        <AppointmentBooking 
          isOpen={showAppointmentBooking} 
          onClose={() => setShowAppointmentBooking(false)} 
        />
        
        <VideoCall 
          isOpen={showVideoCall} 
          onClose={() => setShowVideoCall(false)}
          participant={{ id: 'doctor-1', name: 'Dr. Sarah Smith', avatar: '👩‍⚕️' }}
        />
        
        <PrescriptionUpload 
          isOpen={showPrescriptionUpload} 
          onClose={() => setShowPrescriptionUpload(false)} 
        />
      </div>
    </div>
  );
};