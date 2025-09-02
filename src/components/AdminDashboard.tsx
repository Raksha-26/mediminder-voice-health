import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { demoData } from '@/data/demoData';
import { Users, UserCheck, Stethoscope, Calendar, DollarSign, Activity, TrendingUp, Clock } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { currentUser } = useApp();

  const stats = {
    totalPatients: demoData.users.filter(u => u.role === 'patient').length,
    totalDoctors: demoData.users.filter(u => u.role === 'doctor').length,
    totalAppointments: demoData.appointments.length,
    completedAppointments: demoData.appointments.filter(a => a.status === 'completed').length,
    confirmedIntakes: demoData.intakes.filter(i => i.confirmed).length,
    totalIntakes: demoData.intakes.length,
    platformRevenue: 15420, // Mock data
    doctorFees: 12500 // Mock data
  };

  const recentActivities = [
    { type: 'appointment', message: 'New appointment scheduled by Sarah Johnson', time: '2 hours ago' },
    { type: 'confirmation', message: 'Voice confirmation received for Aspirin intake', time: '3 hours ago' },
    { type: 'registration', message: 'New doctor Dr. Rajesh Kumar registered', time: '1 day ago' },
    { type: 'payment', message: 'Platform fee payment received - $150', time: '1 day ago' }
  ];

  const systemMetrics = [
    { label: 'Response Time', value: '0.8s', trend: 'down', good: true },
    { label: 'Uptime', value: '99.9%', trend: 'stable', good: true },
    { label: 'Error Rate', value: '0.02%', trend: 'down', good: true },
    { label: 'Active Sessions', value: '234', trend: 'up', good: true }
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard 👤</h1>
          <p className="text-muted-foreground">Platform overview and management</p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Registered Patients</p>
                  <p className="text-2xl font-bold text-primary">{stats.totalPatients}</p>
                  <p className="text-xs text-success">+12% this month</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Doctors</p>
                  <p className="text-2xl font-bold text-secondary">{stats.totalDoctors}</p>
                  <p className="text-xs text-success">+5% this month</p>
                </div>
                <Stethoscope className="w-8 h-8 text-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Appointments</p>
                  <p className="text-2xl font-bold text-warning">{stats.totalAppointments}</p>
                  <p className="text-xs text-muted-foreground">{stats.completedAppointments} completed</p>
                </div>
                <Calendar className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Platform Revenue</p>
                  <p className="text-2xl font-bold text-success">${stats.platformRevenue.toLocaleString()}</p>
                  <p className="text-xs text-success">+18% this month</p>
                </div>
                <DollarSign className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Medicine Compliance & System Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Medicine Compliance
              </CardTitle>
              <CardDescription>Patient medication adherence metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-success/10 rounded">
                  <div>
                    <p className="font-semibold text-success">Confirmed Intakes</p>
                    <p className="text-sm text-muted-foreground">Today's completed doses</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-success">{stats.confirmedIntakes}</p>
                    <p className="text-xs text-muted-foreground">of {stats.totalIntakes}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-warning/10 rounded">
                  <div>
                    <p className="font-semibold text-warning">Compliance Rate</p>
                    <p className="text-sm text-muted-foreground">Overall adherence</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-warning">
                      {Math.round((stats.confirmedIntakes / stats.totalIntakes) * 100)}%
                    </p>
                    <Badge variant="outline">Good</Badge>
                  </div>
                </div>

                <div className="p-3 bg-primary/10 rounded">
                  <p className="font-semibold text-primary mb-2">Voice Confirmations</p>
                  <p className="text-sm text-muted-foreground">
                    {demoData.intakes.filter(i => i.confirmationMethod === 'voice').length} patients using voice features
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-secondary" />
                System Health
              </CardTitle>
              <CardDescription>Platform performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemMetrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-semibold">{metric.label}</p>
                      <p className="text-sm text-muted-foreground">System performance</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{metric.value}</p>
                      <Badge variant={metric.good ? 'default' : 'destructive'}>
                        {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities & Doctor Fees */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-warning" />
                Recent Activities
              </CardTitle>
              <CardDescription>Latest platform interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-success" />
                Revenue Breakdown
              </CardTitle>
              <CardDescription>Financial overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-success/10 rounded">
                  <div>
                    <p className="font-semibold text-success">Platform Fees</p>
                    <p className="text-sm text-muted-foreground">15% commission</p>
                  </div>
                  <p className="text-xl font-bold text-success">${stats.platformRevenue.toLocaleString()}</p>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-primary/10 rounded">
                  <div>
                    <p className="font-semibold text-primary">Doctor Earnings</p>
                    <p className="text-sm text-muted-foreground">Total payouts</p>
                  </div>
                  <p className="text-xl font-bold text-primary">${stats.doctorFees.toLocaleString()}</p>
                </div>

                <div className="p-3 border rounded">
                  <p className="font-semibold mb-2">Monthly Growth</p>
                  <div className="flex justify-between text-sm">
                    <span>Appointments</span>
                    <span className="text-success">+23%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>New Users</span>
                    <span className="text-success">+15%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Revenue</span>
                    <span className="text-success">+18%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};