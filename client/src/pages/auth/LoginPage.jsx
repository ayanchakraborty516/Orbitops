import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { Logo } from '../../components/brand/Logo.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { ThemeToggle } from '../../components/ui/ThemeToggle.jsx';
import { Mail, Lock, Sparkles } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { success, error: toastError } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, password });
      success('Welcome back to OrbitOps Command Center!');
      const from = location.state?.from?.pathname || '/app/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      toastError(err.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[#F3EFE7] dark:bg-[#161714] text-[#24251F] dark:text-[#EDE8DF] transition-colors relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <Link to="/">
          <Logo size="xl" />
        </Link>
        <h2 className="mt-6 text-center text-2xl font-serif font-medium tracking-tight text-[#24251F] dark:text-[#F3EFE7]">
          Sign in to your command center
        </h2>
        <p className="mt-2 text-center text-xs text-[#5A5C54] dark:text-[#A6A89E] font-sans">
          Or{' '}
          <Link to="/register" className="font-semibold text-[#C65D3A] dark:text-[#D97753] hover:underline">
            initialize a new organization workspace
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-[#FAF7F2] dark:bg-[#20221E] py-8 px-6 sm:px-9 border border-[#D8D0C3] dark:border-[#353831] rounded-xl shadow-xs">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-[#C65D3A]/10 border border-[#C65D3A]/25 text-xs text-[#C65D3A] dark:text-[#D97753] font-mono">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Work Email"
              type="email"
              icon={Mail}
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-[#24251F] dark:text-[#EDE8DF]">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-[#C65D3A] dark:text-[#D97753] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                icon={Lock}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" variant="primary" size="md" isLoading={isLoading} className="w-full mt-2">
              Sign In to OrbitOps
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
