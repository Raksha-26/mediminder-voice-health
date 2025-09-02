import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { Heart, Stethoscope, Settings } from 'lucide-react';

const roles = [
  {
    role: 'patient' as UserRole,
    title: 'Patient',
    description: 'Manage your health, medications, and appointments',
    icon: Heart,
    gradient: 'medical-gradient',
    email: 'patient@mediminder.com'
  },
  {
    role: 'doctor' as UserRole,
    title: 'Doctor',
    description: 'Manage patients, prescriptions, and consultations',
    icon: Stethoscope,
    gradient: 'success-gradient',
    email: 'doctor@mediminder.com'
  },
  {
    role: 'admin' as UserRole,
    title: 'Admin',
    description: 'Platform management and analytics',
    icon: Settings,
    gradient: 'medical-gradient',
    email: 'admin@mediminder.com'
  }
];

export const RoleSelector: React.FC = () => {
  const { loginAsRole } = useApp();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 medical-gradient bg-clip-text text-transparent">
          🏥 Mediminder
        </h1>
        <p className="text-xl text-muted-foreground">
          Complete Health Management Platform
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Choose your role to access the demo
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        {roles.map(({ role, title, description, icon: Icon, gradient, email }) => (
          <Card 
            key={role} 
            className="card-shadow hover:medical-shadow transition-smooth cursor-pointer group"
          >
            <CardHeader className="text-center">
              <div className={`${gradient} p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-bounce`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">{title}</CardTitle>
              <CardDescription className="text-center">
                {description}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-xs text-muted-foreground mb-4 p-2 bg-muted rounded">
                Demo Login: {email}
              </div>
              <Button 
                onClick={() => loginAsRole(role)}
                className="w-full transition-smooth"
                variant={role === 'patient' ? 'default' : role === 'doctor' ? 'secondary' : 'outline'}
              >
                Login as {title}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>🎤 Voice commands supported • 🌐 Multilingual interface • ⚡ Real-time updates</p>
      </div>
    </div>
  );
};