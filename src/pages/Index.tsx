import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { RoleSelector } from '@/components/RoleSelector';
import { PatientDashboard } from '@/components/PatientDashboard';
import { DoctorDashboard } from '@/components/DoctorDashboard';
import { AdminDashboard } from '@/components/AdminDashboard';
import { AppHeader } from '@/components/AppHeader';

const Index = () => {
  const { currentUser } = useApp();

  // Show role selector if no user is logged in
  if (!currentUser) {
    return <RoleSelector />;
  }

  // Render appropriate dashboard based on user role
  const renderDashboard = () => {
    switch (currentUser.role) {
      case 'patient':
        return <PatientDashboard />;
      case 'doctor':
        return <DoctorDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <RoleSelector />;
    }
  };

  return (
    <>
      <AppHeader />
      {renderDashboard()}
    </>
  );
};

export default Index;
