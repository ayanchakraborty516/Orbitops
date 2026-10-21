import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Logo } from '../../components/brand/Logo.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { ThemeToggle } from '../../components/ui/ThemeToggle.jsx';
import { Mail, Lock, ArrowLeft, KeyRound } from 'lucide-react';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [step, setStep] = useState('request'); // 'request' | 'reset'
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [simulatedInfo, setSimulatedInfo] = useState(null);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await authApi.forgotPassword(email);
      setSimulatedInfo(res);
      setStep('reset');
      success('Password reset initiated. You can now set a new password below.');
    } catch (err) {
      toastError(err.message || 'Request failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetNewPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authApi.resetPassword({ email, newPassword });
      success('Password successfully reset! Please sign in with your new password.');
      navigate('/login');
    } catch (err) {
      toastError(err.message || 'Reset failed');
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
          Password Recovery
        </h2>
        <p className="mt-2 text-center text-xs text-[#5A5C54] dark:text-[#A6A89E] font-sans">
          Restore access to your OrbitOps engineering account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-[#FAF7F2] dark:bg-[#20221E] py-8 px-6 sm:px-9 border border-[#D8D0C3] dark:border-[#353831] rounded-xl shadow-xs">
          {step === 'request' ? (
            <form className="space-y-4" onSubmit={handleRequestReset}>
              <p className="text-xs text-[#5A5C54] dark:text-[#A6A89E] leading-relaxed">
                Enter your registered work email. In local environments, the backend bypasses external SMTP dependencies safely.
              </p>

              <Input
                label="Account Email"
                type="email"
                icon={Mail}
                placeholder="admin@orbitops.dev"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />

              <Button type="submit" variant="primary" size="md" isLoading={isLoading} className="w-full">
                Verify Account & Continue
              </Button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleSetNewPassword}>
              <div className="p-3.5 rounded-lg bg-[#ECE7DE]/70 dark:bg-[#1A1C18] border border-[#D8D0C3] dark:border-[#353831] text-xs text-[#24251F] dark:text-[#EDE8DF]">
                <p className="font-semibold flex items-center gap-1.5 font-mono text-[11px] text-[#C65D3A] dark:text-[#D97753]">
                  <KeyRound className="w-3.5 h-3.5" /> Account Verified for {email}
                </p>
                <p className="text-[11px] text-[#7C7E74] dark:text-[#8E9086] mt-1 font-mono">{simulatedInfo?.note}</p>
              </div>

              <Input
                label="New Password"
                type="password"
                icon={Lock}
                placeholder="New password (min 6 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoFocus
              />

              <Button type="submit" variant="primary" size="md" isLoading={isLoading} className="w-full">
                Confirm & Update Password
              </Button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-[#D8D0C3] dark:border-[#353831] text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[#5A5C54] dark:text-[#A6A89E] hover:text-[#C65D3A] dark:hover:text-[#D97753] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
