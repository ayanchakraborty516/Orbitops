import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { Logo } from '../../components/brand/Logo.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { ThemeToggle } from '../../components/ui/ThemeToggle.jsx';
import { Mail, Lock, User, Check } from 'lucide-react';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { success, error: toastError } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      await register({ name, email, password });
      success('Workspace created successfully! Welcome to OrbitOps.');
      navigate('/app/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
      toastError(err.message || 'Registration failed');
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
          Initialize your operations workspace
        </h2>
        <p className="mt-2 text-center text-xs text-[#5A5C54] dark:text-[#A6A89E] font-sans">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-[#C65D3A] dark:text-[#D97753] hover:underline">
            Sign in
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
              label="Full Name"
              type="text"
              icon={User}
              placeholder="e.g. Alex Morgan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />

            <Input
              label="Work Email"
              type="email"
              icon={Mail}
              placeholder="alex@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password (min 6 characters)"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="space-y-2 pt-2 text-[11px] font-mono text-[#7C7E74] dark:text-[#8E9086]">
              <p className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#4A6B53]" /> Isolated organization workspace</p>
              <p className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#4A6B53]" /> Full Owner privileges & seed telemetry</p>
            </div>

            <Button type="submit" variant="primary" size="md" isLoading={isLoading} className="w-full mt-2">
              Create Organization Workspace
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
