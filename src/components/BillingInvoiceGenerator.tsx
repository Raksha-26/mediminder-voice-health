import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Receipt, Download, Plus, Trash2 } from 'lucide-react';

interface ServiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface BillData {
  invoiceNumber: string;
  patientName: string;
  patientEmail: string;
  doctorName: string;
  consultationDate: string;
  consultationType: string;
  services: ServiceItem[];
  subtotal: number;
  platformFee: number;
  tax: number;
  total: number;
  notes: string;
}

interface BillingInvoiceGeneratorProps {
  patientId?: string;
  doctorId?: string;
  consultationId?: string;
  onInvoiceGenerated?: (invoice: any) => void;
}

export const BillingInvoiceGenerator: React.FC<BillingInvoiceGeneratorProps> = ({
  patientId,
  doctorId,
  consultationId,
  onInvoiceGenerated
}) => {
  const { toast } = useToast();

  const [billData, setBillData] = useState<BillData>({
    invoiceNumber: `INV-${Date.now()}`,
    patientName: '',
    patientEmail: '',
    doctorName: '',
    consultationDate: new Date().toISOString().split('T')[0],
    consultationType: 'consultation',
    services: [{ description: 'Consultation Fee', quantity: 1, rate: 500, amount: 500 }],
    subtotal: 500,
    platformFee: 50,
    tax: 55,
    total: 605,
    notes: ''
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const addService = () => {
    setBillData(prev => ({
      ...prev,
      services: [...prev.services, { description: '', quantity: 1, rate: 0, amount: 0 }]
    }));
  };

  const removeService = (index: number) => {
    setBillData(prev => {
      const newServices = prev.services.filter((_, i) => i !== index);
      const subtotal = newServices.reduce((sum, service) => sum + service.amount, 0);
      const platformFee = subtotal * 0.1; // 10% platform fee
      const tax = (subtotal + platformFee) * 0.1; // 10% tax
      const total = subtotal + platformFee + tax;

      return {
        ...prev,
        services: newServices,
        subtotal,
        platformFee,
        tax,
        total
      };
    });
  };

  const updateService = (index: number, field: keyof ServiceItem, value: string | number) => {
    setBillData(prev => {
      const newServices = [...prev.services];
      newServices[index] = { ...newServices[index], [field]: value };
      
      // Calculate amount for this service
      if (field === 'quantity' || field === 'rate') {
        newServices[index].amount = newServices[index].quantity * newServices[index].rate;
      }

      // Recalculate totals
      const subtotal = newServices.reduce((sum, service) => sum + service.amount, 0);
      const platformFee = subtotal * 0.1; // 10% platform fee
      const tax = (subtotal + platformFee) * 0.1; // 10% tax
      const total = subtotal + platformFee + tax;

      return {
        ...prev,
        services: newServices,
        subtotal,
        platformFee,
        tax,
        total
      };
    });
  };

  const updateField = (field: keyof BillData, value: any) => {
    setBillData(prev => ({ ...prev, [field]: value }));
  };

  const generateInvoiceHTML = () => {
    const currentDate = new Date().toLocaleDateString();
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice - ${billData.invoiceNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; color: #333; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0EA5E9; padding-bottom: 20px; margin-bottom: 30px; }
    .logo { font-size: 28px; font-weight: bold; color: #0EA5E9; }
    .invoice-title { text-align: right; }
    .invoice-number { font-size: 20px; font-weight: bold; color: #333; }
    .bill-to { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px; }
    .services-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
    .services-table th, .services-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    .services-table th { background-color: #0EA5E9; color: white; font-weight: bold; }
    .services-table .amount-col { text-align: right; }
    .totals { margin-left: auto; width: 300px; margin-top: 20px; }
    .totals table { width: 100%; border-collapse: collapse; }
    .totals td { padding: 8px; border-bottom: 1px solid #eee; }
    .totals .total-row { font-weight: bold; font-size: 18px; border-top: 2px solid #333; }
    .notes { margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 8px; }
    .footer { margin-top: 50px; text-align: center; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">MediMinder</div>
      <div>Healthcare Platform</div>
    </div>
    <div class="invoice-title">
      <div class="invoice-number">Invoice #${billData.invoiceNumber}</div>
      <div>Date: ${currentDate}</div>
    </div>
  </div>

  <div class="bill-to">
    <div>
      <h3>Bill To:</h3>
      <strong>${billData.patientName}</strong><br>
      ${billData.patientEmail}<br>
      Patient ID: ${patientId || 'N/A'}
    </div>
    <div>
      <h3>Service Provider:</h3>
      <strong>Dr. ${billData.doctorName}</strong><br>
      Consultation Date: ${billData.consultationDate}<br>
      Type: ${billData.consultationType}
    </div>
  </div>

  <table class="services-table">
    <thead>
      <tr>
        <th>Description</th>
        <th>Quantity</th>
        <th>Rate (₹)</th>
        <th class="amount-col">Amount (₹)</th>
      </tr>
    </thead>
    <tbody>
      ${billData.services.map(service => `
        <tr>
          <td>${service.description}</td>
          <td>${service.quantity}</td>
          <td>₹${service.rate.toFixed(2)}</td>
          <td class="amount-col">₹${service.amount.toFixed(2)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="totals">
    <table>
      <tr>
        <td>Subtotal:</td>
        <td class="amount-col">₹${billData.subtotal.toFixed(2)}</td>
      </tr>
      <tr>
        <td>Platform Fee (10%):</td>
        <td class="amount-col">₹${billData.platformFee.toFixed(2)}</td>
      </tr>
      <tr>
        <td>Tax (10%):</td>
        <td class="amount-col">₹${billData.tax.toFixed(2)}</td>
      </tr>
      <tr class="total-row">
        <td>Total:</td>
        <td class="amount-col">₹${billData.total.toFixed(2)}</td>
      </tr>
    </table>
  </div>

  ${billData.notes ? `
  <div class="notes">
    <h4>Notes:</h4>
    ${billData.notes}
  </div>
  ` : ''}

  <div class="footer">
    Thank you for choosing MediMinder Healthcare Platform<br>
    This is a computer-generated invoice. No signature required.
  </div>
</body>
</html>
    `;
  };

  const generateInvoice = async () => {
    setIsGenerating(true);
    
    try {
      // Generate HTML content
      const htmlContent = generateInvoiceHTML();
      
      // Open print dialog
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        setTimeout(() => {
          printWindow.print();
        }, 100);
      }

      // Save invoice data (in real app, this would be API call)
      const invoice = {
        id: billData.invoiceNumber,
        patientId,
        doctorId,
        consultationId,
        ...billData,
        createdAt: new Date().toISOString(),
        status: 'generated'
      };

      onInvoiceGenerated?.(invoice);

      toast({
        title: "Invoice Generated",
        description: `Invoice ${billData.invoiceNumber} has been generated successfully`,
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate invoice",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="w-6 h-6 text-primary" />
          Invoice Generator
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Invoice Number</Label>
            <Input
              value={billData.invoiceNumber}
              onChange={(e) => updateField('invoiceNumber', e.target.value)}
              disabled
            />
          </div>
          <div>
            <Label>Consultation Date</Label>
            <Input
              type="date"
              value={billData.consultationDate}
              onChange={(e) => updateField('consultationDate', e.target.value)}
            />
          </div>
        </div>

        {/* Patient and Doctor Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-4">
            <h4 className="font-semibold mb-3">Patient Information</h4>
            <div className="space-y-3">
              <div>
                <Label>Patient Name</Label>
                <Input
                  value={billData.patientName}
                  onChange={(e) => updateField('patientName', e.target.value)}
                  placeholder="Enter patient name"
                />
              </div>
              <div>
                <Label>Patient Email</Label>
                <Input
                  type="email"
                  value={billData.patientEmail}
                  onChange={(e) => updateField('patientEmail', e.target.value)}
                  placeholder="patient@email.com"
                />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="font-semibold mb-3">Doctor Information</h4>
            <div className="space-y-3">
              <div>
                <Label>Doctor Name</Label>
                <Input
                  value={billData.doctorName}
                  onChange={(e) => updateField('doctorName', e.target.value)}
                  placeholder="Enter doctor name"
                />
              </div>
              <div>
                <Label>Consultation Type</Label>
                <Select value={billData.consultationType} onValueChange={(value) => updateField('consultationType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultation">General Consultation</SelectItem>
                    <SelectItem value="follow-up">Follow-up</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="specialist">Specialist Consultation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </div>

        {/* Services */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <Label className="text-lg">Services</Label>
            <Button onClick={addService} size="sm" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Service
            </Button>
          </div>
          
          <div className="space-y-3">
            {billData.services.map((service, index) => (
              <Card key={index} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                  <div className="md:col-span-2">
                    <Label>Description</Label>
                    <Input
                      value={service.description}
                      onChange={(e) => updateService(index, 'description', e.target.value)}
                      placeholder="Service description"
                    />
                  </div>
                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={service.quantity}
                      onChange={(e) => updateService(index, 'quantity', parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div>
                    <Label>Rate (₹)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={service.rate}
                      onChange={(e) => updateService(index, 'rate', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Label>Amount (₹)</Label>
                      <Input
                        value={`₹${service.amount.toFixed(2)}`}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    {billData.services.length > 1 && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => removeService(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Totals */}
        <Card className="p-4 ml-auto max-w-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{billData.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Platform Fee (10%):</span>
              <span>₹{billData.platformFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (10%):</span>
              <span>₹{billData.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>₹{billData.total.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {/* Notes */}
        <div>
          <Label>Notes</Label>
          <Textarea
            value={billData.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            placeholder="Additional notes or payment terms..."
            rows={3}
          />
        </div>

        {/* Generate Button */}
        <div className="flex justify-end">
          <Button 
            onClick={generateInvoice}
            disabled={isGenerating || !billData.patientName || !billData.doctorName}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {isGenerating ? 'Generating...' : 'Generate Invoice'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};