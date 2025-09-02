import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/contexts/AppContext';
import { useTranslation, LanguageCode, SUPPORTED_LANGUAGES } from '@/utils/i18n';
import { useToast } from '@/hooks/use-toast';
import { Stethoscope, Globe, User, UserCheck } from 'lucide-react';
import { UserRole } from '@/types';

interface SignupPageProps {
  onLogin: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onLogin }) => {
  const { language, setLanguage } = useApp();
  const { t } = useTranslation(language);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '' as UserRole | ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    // Simulate signup process
    setTimeout(() => {
      toast({
        title: "Account Created!",
        description: `Welcome ${formData.fullName}! Please login to continue.`,
      });
      setIsLoading(false);
      onLogin();
    }, 1000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Language Selector */}
        <div className="flex justify-end mb-4">
          <Select
            value={language}
            onValueChange={(value: LanguageCode) => setLanguage(value)}
          >
            <SelectTrigger className="w-40">
              <Globe className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SUPPORTED_LANGUAGES).map(([code, lang]) => (
                <SelectItem key={code} value={code}>
                  <span className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card className="card-shadow">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Stethoscope className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold gradient-text">Mediminder</h1>
            </div>
            <CardTitle>{t('signup')}</CardTitle>
            <CardDescription>
              Create your healthcare account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">{t('full_name')}</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">{t('select_role')}</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: UserRole) => handleInputChange('role', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patient">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{t('patient')}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="doctor">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4" />
                        <span>{t('doctor')}</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('password')}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !formData.role}
              >
                {isLoading ? 'Creating Account...' : t('create_account')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {t('have_account')}{' '}
                <Button variant="link" className="p-0 h-auto" onClick={onLogin}>
                  {t('login')}
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};