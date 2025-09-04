import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, CheckCircle, XCircle, Clock, Users, Activity, TrendingUp, TrendingDown } from 'lucide-react';

interface ComplianceData {
  patientId: string;
  patientName: string;
  medicineId: string;
  medicineName: string;
  scheduledTime: string;
  confirmed: boolean;
  missedCount: number;
  caretakerAlerted: boolean;
  riskLevel: 'low' | 'medium' | 'high';
}

interface ComplianceMetrics {
  totalPatients: number;
  compliantPatients: number;
  nonCompliantPatients: number;
  complianceRate: number;
  missedDoses: number;
  caretakerAlerts: number;
}

export const ComplianceDashboard: React.FC = () => {
  const [complianceData, setComplianceData] = useState<ComplianceData[]>([]);
  const [metrics, setMetrics] = useState<ComplianceMetrics>({
    totalPatients: 0,
    compliantPatients: 0,
    nonCompliantPatients: 0,
    complianceRate: 0,
    missedDoses: 0,
    caretakerAlerts: 0
  });
  
  const [timeFilter, setTimeFilter] = useState('today');
  const [riskFilter, setRiskFilter] = useState('all');

  // Mock data for demonstration
  useEffect(() => {
    const mockData: ComplianceData[] = [
      {
        patientId: 'patient-1',
        patientName: 'Sarah Johnson',
        medicineId: 'med-1',
        medicineName: 'Aspirin 100mg',
        scheduledTime: '2024-01-15T09:00:00Z',
        confirmed: false,
        missedCount: 2,
        caretakerAlerted: true,
        riskLevel: 'high'
      },
      {
        patientId: 'patient-2',
        patientName: 'John Smith',
        medicineId: 'med-2',
        medicineName: 'Metformin 500mg',
        scheduledTime: '2024-01-15T08:00:00Z',
        confirmed: true,
        missedCount: 0,
        caretakerAlerted: false,
        riskLevel: 'low'
      },
      {
        patientId: 'patient-3',
        patientName: 'Maria Garcia',
        medicineId: 'med-3',
        medicineName: 'Lisinopril 10mg',
        scheduledTime: '2024-01-15T20:00:00Z',
        confirmed: false,
        missedCount: 1,
        caretakerAlerted: false,
        riskLevel: 'medium'
      },
      {
        patientId: 'patient-4',
        patientName: 'David Lee',
        medicineId: 'med-4',
        medicineName: 'Atorvastatin 20mg',
        scheduledTime: '2024-01-15T21:00:00Z',
        confirmed: true,
        missedCount: 0,
        caretakerAlerted: false,
        riskLevel: 'low'
      }
    ];

    setComplianceData(mockData);

    // Calculate metrics
    const totalPatients = mockData.length;
    const compliantPatients = mockData.filter(item => item.confirmed).length;
    const nonCompliantPatients = totalPatients - compliantPatients;
    const complianceRate = (compliantPatients / totalPatients) * 100;
    const missedDoses = mockData.reduce((sum, item) => sum + item.missedCount, 0);
    const caretakerAlerts = mockData.filter(item => item.caretakerAlerted).length;

    setMetrics({
      totalPatients,
      compliantPatients,
      nonCompliantPatients,
      complianceRate,
      missedDoses,
      caretakerAlerts
    });
  }, [timeFilter]);

  const filteredData = complianceData.filter(item => {
    if (riskFilter === 'all') return true;
    return item.riskLevel === riskFilter;
  });

  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          High Risk
        </Badge>;
      case 'medium':
        return <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Medium Risk
        </Badge>;
      case 'low':
        return <Badge variant="default" className="flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Low Risk
        </Badge>;
      default:
        return null;
    }
  };

  const sendCaretakerAlert = (patientId: string, patientName: string) => {
    // Update the data to mark caretaker as alerted
    setComplianceData(prev => 
      prev.map(item => 
        item.patientId === patientId 
          ? { ...item, caretakerAlerted: true }
          : item
      )
    );

    // Show success message (in real app, this would trigger actual notification)
    alert(`Caretaker alert sent for ${patientName}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Compliance Dashboard</h2>
          <p className="text-muted-foreground">Monitor patient medicine compliance and missed doses</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk</SelectItem>
              <SelectItem value="high">High Risk</SelectItem>
              <SelectItem value="medium">Medium Risk</SelectItem>
              <SelectItem value="low">Low Risk</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Compliance Rate</p>
                <p className="text-2xl font-bold">{metrics.complianceRate.toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                {metrics.complianceRate >= 80 ? (
                  <TrendingUp className="w-5 h-5 text-primary" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-destructive" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Patients</p>
                <p className="text-2xl font-bold">{metrics.totalPatients}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-full">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Missed Doses</p>
                <p className="text-2xl font-bold">{metrics.missedDoses}</p>
              </div>
              <div className="p-3 bg-destructive/10 rounded-full">
                <XCircle className="w-5 h-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Caretaker Alerts</p>
                <p className="text-2xl font-bold">{metrics.caretakerAlerts}</p>
              </div>
              <div className="p-3 bg-orange-500/10 rounded-full">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Patient Compliance Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredData.map((item) => (
              <div key={`${item.patientId}-${item.medicineId}`} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <div>
                    <p className="font-semibold">{item.patientName}</p>
                    <p className="text-sm text-muted-foreground">{item.patientId}</p>
                  </div>
                  
                  <div>
                    <p className="font-medium">{item.medicineName}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(item.scheduledTime).toLocaleTimeString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {item.confirmed ? (
                      <Badge variant="default" className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Confirmed
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        Missed
                      </Badge>
                    )}
                    {getRiskBadge(item.riskLevel)}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Missed: {item.missedCount} times
                      </p>
                      {item.caretakerAlerted && (
                        <p className="text-xs text-orange-600">Caretaker alerted</p>
                      )}
                    </div>
                    
                    {!item.confirmed && !item.caretakerAlerted && item.missedCount > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendCaretakerAlert(item.patientId, item.patientName)}
                        className="flex items-center gap-1"
                      >
                        <AlertTriangle className="w-3 h-3" />
                        Alert Caretaker
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredData.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No compliance data available for the selected filters.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};