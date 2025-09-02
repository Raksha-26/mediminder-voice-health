import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { useTranslation, LanguageCode, SUPPORTED_LANGUAGES } from '@/utils/i18n';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Stethoscope, Globe } from 'lucide-react';

interface LoginPageProps {
  onSignup: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSignup }) => {
  const { loginAsRole, language, setLanguage } = useApp();
  const { t } = useTranslation(language);
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login process
    setTimeout(() => {
      // Demo login logic
      if (email === 'patient@mediminder.com') {
        loginAsRole('patient');
        toast({
          title: "Welcome back!",
          description: "Successfully logged in as Patient",
        });
      } else if (email === 'doctor@mediminder.com') {
        loginAsRole('doctor');
        toast({
          title: "Welcome back!",
          description: "Successfully logged in as Doctor",
        });
      } else if (email === 'admin@mediminder.com') {
        loginAsRole('admin');
        toast({
          title: "Welcome back!",
          description: "Successfully logged in as Admin",
        });
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid credentials. Use demo accounts.",
          variant: "destructive"
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  const demoAccounts = [
    { email: 'patient@mediminder.com', role: t('patient'), icon: '👥' },
    { email: 'doctor@mediminder.com', role: t('doctor'), icon: '👨‍⚕️' },
    { email: 'admin@mediminder.com', role: t('admin'), icon: '👤' }
  ];

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
            <CardTitle>{t('login')}</CardTitle>
            <CardDescription>
              Access your healthcare dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">{t('password')}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : t('login')}
              </Button>
            </form>

            <div className="mt-6">
              <div className="text-center text-sm text-muted-foreground mb-3">
                Demo Accounts
              </div>
              <div className="space-y-2">
                {demoAccounts.map((account) => (
                  <Button
                    key={account.email}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      setEmail(account.email);
                      setPassword('demo123');
                    }}
                  >
                    <span className="mr-2">{account.icon}</span>
                    <span className="flex-1 text-left">{account.role}</span>
                    <span className="text-xs text-muted-foreground">{account.email}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {t('no_account')}{' '}
                <Button variant="link" className="p-0 h-auto" onClick={onSignup}>
                  {t('signup')}
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};