import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from '@/utils/i18n';
import { useToast } from '@/hooks/use-toast';
import { demoData } from '@/data/demoData';
import { Calendar, Clock, User, FileText, X } from 'lucide-react';

interface AppointmentBookingProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppointmentBooking: React.FC<AppointmentBookingProps> = ({ isOpen, onClose }) => {
  const { currentUser, language } = useApp();
  const { t } = useTranslation(language);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    doctorId: '',
    date: '',
    time: '',
    type: 'consultation',
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const doctors = demoData.users.filter(u => u.role === 'doctor');
  
  const availableTimeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate booking process
    setTimeout(() => {
      const doctor = doctors.find(d => d.id === formData.doctorId);
      
      toast({
        title: t('appointment_booked'),
        description: `${t('appointment_scheduled')} with ${doctor?.name} on ${formData.date} at ${formData.time}`,
      });

      // Add to demo data (in real app, this would be API call)
      const newAppointment = {
        id: `apt-${Date.now()}`,
        patientId: currentUser?.id || '',
        doctorId: formData.doctorId,
        date: formData.date,
        time: formData.time,
        status: 'pending' as const,
        type: formData.type as 'consultation' | 'follow-up' | 'emergency',
        notes: formData.notes
      };

      // In real app, this would update the backend
      demoData.appointments.push(newAppointment);

      setIsLoading(false);
      onClose();
      
      // Reset form
      setFormData({
        doctorId: '',
        date: '',
        time: '',
        type: 'consultation',
        notes: ''
      });
    }, 1000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            {t('book_new_appointment')}
          </DialogTitle>
          <DialogDescription>
            Schedule your consultation with our doctors
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleBooking} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="doctor">{t('select_doctor')}</Label>
            <Select
              value={formData.doctorId}
              onValueChange={(value) => handleInputChange('doctorId', value)}
            >
              <SelectTrigger>
                <User className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Choose a doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    <div className="flex items-center gap-2">
                      <span>{doctor.avatar}</span>
                      <span>{doctor.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">{t('select_date')}</Label>
              <Input
                id="date"
                type="date"
                min={today}
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">{t('select_time')}</Label>
              <Select
                value={formData.time}
                onValueChange={(value) => handleInputChange('time', value)}
              >
                <SelectTrigger>
                  <Clock className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Time" />
                </SelectTrigger>
                <SelectContent>
                  {availableTimeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">{t('appointment_type')}</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleInputChange('type', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="consultation">{t('consultation')}</SelectItem>
                <SelectItem value="follow-up">{t('follow_up')}</SelectItem>
                <SelectItem value="emergency">{t('emergency')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t('notes')} (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any specific concerns or requirements..."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.doctorId || !formData.date || !formData.time}
              className="flex-1"
            >
              {isLoading ? 'Booking...' : t('book_appointment_btn')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};