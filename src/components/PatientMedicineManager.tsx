import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { demoData } from '@/data/demoData';
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from '@/utils/i18n';
import { useMedicineReminder } from '@/hooks/useMedicineReminder';
import { Pill, Plus, Edit, Trash2, Camera, Upload, Clock, Bell, Image } from 'lucide-react';

interface PatientMedicineManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions?: string;
  category: string;
  sideEffects?: string;
  timing: string[];
  startDate: string;
  endDate: string;
  imageUrl?: string;
}

export const PatientMedicineManager: React.FC<PatientMedicineManagerProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const { currentUser, language } = useApp();
  const { t } = useTranslation(language);
  const { scheduleAlarm } = useMedicineReminder();
  
  const [patientMedicines, setPatientMedicines] = useState<Medicine[]>(
    demoData.medicines.map(med => ({
      ...med,
      category: med.category || 'tablet',
      sideEffects: med.sideEffects || '',
      timing: med.timing || ['08:00', '13:00', '20:00'],
      startDate: med.startDate || new Date().toISOString().split('T')[0],
      endDate: med.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }))
  );
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [medicineImage, setMedicineImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [selectedTimes, setSelectedTimes] = useState<string[]>(['08:00']);
  
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    instructions: '',
    category: 'tablet',
    sideEffects: '',
    caretakerContact: '',
    soundEnabled: true
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMedicineImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Process OCR
      processOcr(file);
    }
  };

  const processOcr = async (file: File) => {
    setIsProcessingOcr(true);
    
    // Simulate OCR processing
    setTimeout(() => {
      const mockResults = [
        { name: "Paracetamol", dosage: "500mg", frequency: "3 times daily" },
        { name: "Ibuprofen", dosage: "200mg", frequency: "2 times daily" },
        { name: "Amoxicillin", dosage: "250mg", frequency: "3 times daily" },
        { name: "Omeprazole", dosage: "20mg", frequency: "1 time daily" },
        { name: "Metformin", dosage: "500mg", frequency: "2 times daily" }
      ];

      const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
      
      setFormData(prev => ({
        ...prev,
        name: randomResult.name,
        dosage: randomResult.dosage,
        frequency: randomResult.frequency,
        instructions: t('as_prescribed'),
        category: "tablet"
      }));

      setIsProcessingOcr(false);
      setShowAddForm(true);

      toast({
        title: t('ocr_successful'),
        description: t('medicine_info_extracted'),
      });
    }, 3000);
  };

  const handleAddMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newMedicine: Medicine = {
      id: `med-${Date.now()}`,
      ...formData,
      timing: selectedTimes,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      imageUrl: imagePreview
    };

    setPatientMedicines(prev => [...prev, newMedicine]);
    demoData.medicines.push({
      ...newMedicine,
      timing: newMedicine.timing || ['08:00', '13:00', '20:00']
    });
    
    // Schedule alarm for this medicine
    scheduleAlarm({
      medicine: newMedicine,
      patientId: currentUser?.id || '',
      caretakerContact: formData.caretakerContact,
      soundEnabled: formData.soundEnabled
    });
    
    toast({
      title: t('medicine_added'),
      description: `${formData.name} ${t('added_with_reminders')}`,
    });

    resetForm();
    setShowAddForm(false);
  };

  const addTimeSlot = () => {
    setSelectedTimes(prev => [...prev, '12:00']);
  };

  const updateTimeSlot = (index: number, time: string) => {
    setSelectedTimes(prev => prev.map((t, i) => i === index ? time : t));
  };

  const removeTimeSlot = (index: number) => {
    if (selectedTimes.length > 1) {
      setSelectedTimes(prev => prev.filter((_, i) => i !== index));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      dosage: '',
      frequency: '',
      instructions: '',
      category: 'tablet',
      sideEffects: '',
      caretakerContact: '',
      soundEnabled: true
    });
    setSelectedTimes(['08:00']);
    setMedicineImage(null);
    setImagePreview('');
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDeleteMedicine = (medicineId: string) => {
    const medicine = patientMedicines.find(m => m.id === medicineId);
    setPatientMedicines(prev => prev.filter(m => m.id !== medicineId));
    demoData.medicines = demoData.medicines.filter(m => m.id !== medicineId);

    toast({
      title: t('medicine_removed'),
      description: `${medicine?.name} ${t('removed_from_list')}`,
      variant: "destructive"
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-primary" />
            {t('my_medicines')}
          </DialogTitle>
          <DialogDescription>
            {t('manage_medicine_schedule')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add Medicine Section */}
          <div className="flex gap-2">
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t('add_medicine')}
            </Button>
            
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isProcessingOcr}
              />
              <Button variant="outline" disabled={isProcessingOcr}>
                <Camera className="w-4 h-4 mr-2" />
                {isProcessingOcr ? t('processing') : t('upload_medicine_photo')}
              </Button>
            </div>
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingMedicine ? t('edit_medicine') : t('add_new_medicine')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddMedicine} className="space-y-4">
                  {/* Medicine Image Preview */}
                  {imagePreview && (
                    <div className="space-y-2">
                      <Label>{t('medicine_image')}</Label>
                      <div className="w-32 h-32 border rounded-lg overflow-hidden">
                        <img src={imagePreview} alt="Medicine" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t('medicine_name')}</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">{t('category')}</Label>
                      <select
                        id="category"
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="tablet">{t('tablet')}</option>
                        <option value="capsule">{t('capsule')}</option>
                        <option value="syrup">{t('syrup')}</option>
                        <option value="injection">{t('injection')}</option>
                        <option value="cream">{t('cream')}</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dosage">{t('dosage')}</Label>
                      <Input
                        id="dosage"
                        value={formData.dosage}
                        onChange={(e) => handleInputChange('dosage', e.target.value)}
                        placeholder="e.g., 500mg"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="frequency">{t('frequency')}</Label>
                      <Input
                        id="frequency"
                        value={formData.frequency}
                        onChange={(e) => handleInputChange('frequency', e.target.value)}
                        placeholder={t('frequency_placeholder')}
                        required
                      />
                    </div>
                  </div>

                  {/* Medicine Timing */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {t('medicine_times')}
                    </Label>
                    {selectedTimes.map((time, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={time}
                          onChange={(e) => updateTimeSlot(index, e.target.value)}
                          className="w-32"
                        />
                        {selectedTimes.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeTimeSlot(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addTimeSlot}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      {t('add_time')}
                    </Button>
                  </div>

                  {/* Caretaker Contact */}
                  <div className="space-y-2">
                    <Label htmlFor="caretakerContact">{t('caretaker_contact')}</Label>
                    <Input
                      id="caretakerContact"
                      value={formData.caretakerContact}
                      onChange={(e) => handleInputChange('caretakerContact', e.target.value)}
                      placeholder={t('emergency_contact_placeholder')}
                    />
                  </div>

                  {/* Sound Reminder */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="soundEnabled"
                      checked={formData.soundEnabled}
                      onChange={(e) => handleInputChange('soundEnabled', e.target.checked)}
                    />
                    <Label htmlFor="soundEnabled" className="flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      {t('enable_sound_reminders')}
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instructions">{t('instructions')}</Label>
                    <Textarea
                      id="instructions"
                      value={formData.instructions}
                      onChange={(e) => handleInputChange('instructions', e.target.value)}
                      placeholder={t('special_instructions')}
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit">
                      {editingMedicine ? t('update_medicine') : t('add_medicine')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingMedicine(null);
                        resetForm();
                      }}
                    >
                      {t('cancel')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Medicine List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('my_medicine_list')} ({patientMedicines.length})</h3>
            
            {patientMedicines.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Pill className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h4 className="text-lg font-semibold mb-2">{t('no_medicines_added')}</h4>
                  <p className="text-muted-foreground mb-4">{t('add_first_medicine_desc')}</p>
                  <Button onClick={() => setShowAddForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    {t('add_first_medicine')}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {patientMedicines.map((medicine) => (
                  <Card key={medicine.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {medicine.imageUrl ? (
                            <div className="w-10 h-10 rounded-full overflow-hidden">
                              <img src={medicine.imageUrl} alt={medicine.name} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <Pill className="w-5 h-5 text-primary" />
                            </div>
                          )}
                          <div>
                            <h4 className="font-semibold">{medicine.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {medicine.dosage} • {medicine.frequency}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {medicine.timing.join(', ')}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="capitalize">
                            {medicine.category}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteMedicine(medicine.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {medicine.instructions && (
                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>{t('instructions')}:</strong> {medicine.instructions}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};