import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { LogOut, Globe } from 'lucide-react';

export const AppHeader: React.FC = () => {
  const { currentUser, language, setLanguage, logout } = useApp();

  if (!currentUser) return null;

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'patient': return 'bg-primary text-primary-foreground';
      case 'doctor': return 'bg-secondary text-secondary-foreground';
      case 'admin': return 'bg-warning text-warning-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getRoleEmoji = (role: string) => {
    switch (role) {
      case 'patient': return '👩‍💼';
      case 'doctor': return '👨‍⚕️';
      case 'admin': return '👤';
      default: return '👤';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold medical-gradient bg-clip-text text-transparent">
              🏥 Mediminder
            </h1>
            <Badge variant="outline" className="hidden sm:flex">
              Health Management Platform
            </Badge>
          </div>

          {/* User Info & Actions */}
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="hidden sm:flex"
            >
              <Globe className="w-4 h-4 mr-1" />
              {language.toUpperCase()}
            </Button>

            {/* User Profile */}
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{currentUser.name}</p>
                <p className="text-xs text-muted-foreground">{currentUser.email}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-lg">{getRoleEmoji(currentUser.role)}</span>
                <Badge className={getRoleColor(currentUser.role)}>
                  {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
                </Badge>
              </div>
            </div>

            {/* Logout */}
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-destructive hover:text-destructive"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline ml-1">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};