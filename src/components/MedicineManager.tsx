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
import { Pill, Plus, Edit, Trash2, Camera, Upload, FileText } from 'lucide-react';

interface MedicineManagerProps {
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
  timing?: string[];
  startDate?: string;
  endDate?: string;
}

export const MedicineManager: React.FC<MedicineManagerProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [medicines, setMedicines] = useState<Medicine[]>(
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
  const [ocrImage, setOcrImage] = useState<File | null>(null);
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    instructions: '',
    category: 'tablet',
    sideEffects: ''
  });

  const handleAddMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newMedicine: Medicine = {
      id: `med-${Date.now()}`,
      ...formData,
      timing: ['08:00', '13:00', '20:00'], // Default timing
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
    };

    setMedicines(prev => [...prev, newMedicine]);
    demoData.medicines.push(newMedicine);
    
    toast({
      title: "Medicine Added",
      description: `${formData.name} has been added to the medicine list`,
    });

    resetForm();
    setShowAddForm(false);
  };

  const handleEditMedicine = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setFormData({
      name: medicine.name,
      dosage: medicine.dosage,
      frequency: medicine.frequency,
      instructions: medicine.instructions || '',
      category: medicine.category,
      sideEffects: medicine.sideEffects || ''
    });
    setShowAddForm(true);
  };

  const handleUpdateMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingMedicine) return;

    const updatedMedicine = { 
      ...editingMedicine, 
      ...formData,
      timing: editingMedicine.timing || ['08:00', '13:00', '20:00'],
      startDate: editingMedicine.startDate || new Date().toISOString().split('T')[0],
      endDate: editingMedicine.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    setMedicines(prev => prev.map(m => m.id === editingMedicine.id ? updatedMedicine : m));
    
    const index = demoData.medicines.findIndex(m => m.id === editingMedicine.id);
    if (index !== -1) {
      demoData.medicines[index] = updatedMedicine;
    }

    toast({
      title: "Medicine Updated",
      description: `${formData.name} has been updated successfully`,
    });

    resetForm();
    setShowAddForm(false);
    setEditingMedicine(null);
  };

  const handleDeleteMedicine = (medicineId: string) => {
    const medicine = medicines.find(m => m.id === medicineId);
    setMedicines(prev => prev.filter(m => m.id !== medicineId));
    demoData.medicines = demoData.medicines.filter(m => m.id !== medicineId);

    toast({
      title: "Medicine Removed",
      description: `${medicine?.name} has been removed from the list`,
      variant: "destructive"
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOcrImage(file);
      processOcr(file);
    }
  };

  const processOcr = async (file: File) => {
    setIsProcessingOcr(true);
    
    // Simulate OCR processing
    setTimeout(() => {
      // Mock OCR results
      const mockResults = [
        { name: "Paracetamol", dosage: "500mg", frequency: "3 times daily" },
        { name: "Ibuprofen", dosage: "200mg", frequency: "2 times daily" },
        { name: "Amoxicillin", dosage: "250mg", frequency: "3 times daily" }
      ];

      const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
      
      setFormData(prev => ({
        ...prev,
        name: randomResult.name,
        dosage: randomResult.dosage,
        frequency: randomResult.frequency,
        instructions: "As prescribed by doctor",
        category: "tablet"
      }));

      setIsProcessingOcr(false);
      setShowAddForm(true);

      toast({
        title: "OCR Successful",
        description: "Medicine information extracted from image",
      });
    }, 3000);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      dosage: '',
      frequency: '',
      instructions: '',
      category: 'tablet',
      sideEffects: ''
    });
    setOcrImage(null);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-primary" />
            Medicine Manager
          </DialogTitle>
          <DialogDescription>
            Manage your medicine database and add new medicines
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add Medicine Section */}
          <div className="flex gap-2">
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Medicine
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
                {isProcessingOcr ? 'Processing...' : 'Upload Prescription'}
              </Button>
            </div>
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={editingMedicine ? handleUpdateMedicine : handleAddMedicine} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Medicine Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <select
                        id="category"
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="tablet">Tablet</option>
                        <option value="capsule">Capsule</option>
                        <option value="syrup">Syrup</option>
                        <option value="injection">Injection</option>
                        <option value="cream">Cream</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dosage">Dosage</Label>
                      <Input
                        id="dosage"
                        value={formData.dosage}
                        onChange={(e) => handleInputChange('dosage', e.target.value)}
                        placeholder="e.g., 500mg"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="frequency">Frequency</Label>
                      <Input
                        id="frequency"
                        value={formData.frequency}
                        onChange={(e) => handleInputChange('frequency', e.target.value)}
                        placeholder="e.g., 3 times daily"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instructions">Instructions</Label>
                    <Textarea
                      id="instructions"
                      value={formData.instructions}
                      onChange={(e) => handleInputChange('instructions', e.target.value)}
                      placeholder="Special instructions for taking this medicine"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sideEffects">Side Effects</Label>
                    <Textarea
                      id="sideEffects"
                      value={formData.sideEffects}
                      onChange={(e) => handleInputChange('sideEffects', e.target.value)}
                      placeholder="Possible side effects"
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit">
                      {editingMedicine ? 'Update Medicine' : 'Add Medicine'}
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
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Medicine List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Medicine Database ({medicines.length})</h3>
            
            {medicines.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Pill className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h4 className="text-lg font-semibold mb-2">No Medicines Added</h4>
                  <p className="text-muted-foreground mb-4">Start by adding your first medicine to the database</p>
                  <Button onClick={() => setShowAddForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Medicine
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {medicines.map((medicine) => (
                  <Card key={medicine.id}>
                    <CardContent className="p-4">
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
                        
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="capitalize">
                            {medicine.category}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditMedicine(medicine)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
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
                          <strong>Instructions:</strong> {medicine.instructions}
                        </p>
                      )}
                      
                      {medicine.sideEffects && (
                        <p className="text-sm text-muted-foreground">
                          <strong>Side Effects:</strong> {medicine.sideEffects}
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