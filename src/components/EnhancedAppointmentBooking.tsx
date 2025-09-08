import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from '@/utils/i18n';
import { demoData } from '@/data/demoData';
import { Calendar, Clock, User, MessageCircle } from 'lucide-react';

interface EnhancedAppointmentBookingProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EnhancedAppointmentBooking: React.FC<EnhancedAppointmentBookingProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const { currentUser, language } = useApp();
  const { t } = useTranslation(language);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    doctorId: '',
    date: '',
    time: '',
    type: 'consultation' as 'consultation' | 'follow-up' | 'emergency',
    notes: ''
  });

  // Mock doctor schedules
  const doctorSchedules = {
    'doctor-1': {
      name: 'Dr. Sarah Smith',
      specialty: 'General Medicine',
      availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
    },
    'doctor-2': {
      name: 'Dr. John Davis',
      specialty: 'Cardiology',
      availableSlots: ['10:00', '11:00', '14:30', '15:30', '16:30']
    },
    'doctor-3': {
      name: 'Dr. Emily Johnson',
      specialty: 'Pediatrics',
      availableSlots: ['09:30', '10:30', '13:00', '14:00', '15:00']
    }
  };

  const doctors = demoData.users.filter(u => u.role === 'doctor');

  const handleDoctorChange = (doctorId: string) => {
    setSelectedDoctor(doctorId);
    setFormData(prev => ({ ...prev, doctorId }));
    
    // Update available slots based on selected doctor
    const schedule = doctorSchedules[doctorId as keyof typeof doctorSchedules];
    if (schedule) {
      setAvailableSlots(schedule.availableSlots);
    }
    
    // Reset time selection
    setSelectedTimeSlot('');
    setFormData(prev => ({ ...prev, time: '' }));
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate booking API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const doctor = doctors.find(d => d.id === formData.doctorId);
      const doctorSchedule = doctorSchedules[formData.doctorId as keyof typeof doctorSchedules];

      const newAppointment = {
        id: `appointment-${Date.now()}`,
        patientId: currentUser?.id || '',
        doctorId: formData.doctorId,
        date: formData.date,
        time: formData.time,
        status: 'pending' as const,
        type: formData.type,
        notes: formData.notes
      };

      // Add to demo data
      demoData.appointments.push(newAppointment);

      toast({
        title: t('appointment_booked'),
        description: `${t('appointment_with')} ${doctor?.name} ${t('on')} ${formData.date} ${t('at')} ${formData.time}. ${t('waiting_approval')}`,
      });

      // Reset form
      setFormData({
        doctorId: '',
        date: '',
        time: '',
        type: 'consultation',
        notes: ''
      });
      setSelectedDoctor('');
      setSelectedTimeSlot('');
      setAvailableSlots([]);
      
      onClose();
    } catch (error) {
      toast({
        title: t('booking_failed'),
        description: t('try_again'),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = formData.doctorId && formData.date && formData.time && formData.type;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            {t('book_appointment')}
          </DialogTitle>
          <DialogDescription>
            {t('schedule_consultation_desc')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleBooking} className="space-y-4">
          {/* Doctor Selection */}
          <div className="space-y-2">
            <Label htmlFor="doctor" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {t('select_doctor')}
            </Label>
            <select
              id="doctor"
              value={selectedDoctor}
              onChange={(e) => handleDoctorChange(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="">{t('choose_doctor')}</option>
              {Object.entries(doctorSchedules).map(([id, schedule]) => (
                <option key={id} value={id}>
                  {schedule.name} - {schedule.specialty}
                </option>
              ))}
            </select>
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {t('select_date')}
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          {/* Time Slot Selection */}
          {availableSlots.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {t('available_slots')}
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot}
                    type="button"
                    variant={selectedTimeSlot === slot ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSelectedTimeSlot(slot);
                      handleInputChange('time', slot);
                    }}
                  >
                    {slot}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Appointment Type */}
          <div className="space-y-2">
            <Label htmlFor="type">{t('appointment_type')}</Label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="consultation">{t('consultation')}</option>
              <option value="follow-up">{t('follow_up')}</option>
              <option value="emergency">{t('emergency')}</option>
            </select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              {t('notes_optional')}
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder={t('describe_symptoms')}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button 
              type="submit" 
              disabled={!isFormValid || isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? t('booking') : t('book_appointment')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};