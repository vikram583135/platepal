'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Lock, Mail, Truck, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const containerRef = useRef<HTMLDivElement>(null);

  // Animated background particles
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const particles: HTMLDivElement[] = [];

    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'absolute rounded-full opacity-20';
      particle.style.width = `${Math.random() * 4 + 2}px`;
      particle.style.height = particle.style.width;
      particle.style.backgroundColor = 'white';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.setProperty('--tx', `${(Math.random() - 0.5) * 200}px`);
      particle.style.setProperty('--ty', `${(Math.random() - 0.5) * 200}px`);
      particle.style.animation = `particle ${15 + Math.random() * 10}s linear infinite`;
      particle.style.animationDelay = `${Math.random() * 5}s`;
      container.appendChild(particle);
      particles.push(particle);
    }

    return () => {
      particles.forEach(p => p.remove());
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields', {
        icon: '⚠️',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.login(email, password);
      setAuth(response.accessToken, { email, name: email.split('@')[0] });
      toast.success('Login successful!', {
        icon: '✅',
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.', {
        icon: '❌',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCredentials = async () => {
    const text = 'driver1@delivery.com / password123';
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Credentials copied to clipboard!', {
        icon: '📋',
        duration: 2000,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy', {
        icon: '❌',
      });
    }
  };

  return (
    <div 
      ref={containerRef}
      className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-4 bg-gradient-animated"
    >

      {/* Glassmorphism Login Card */}
      <div className="glass-strong rounded-3xl p-8 md:p-10 shadow-2xl-glow max-w-md w-full animate-scale-in">
        {/* Logo Section */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="w-24 h-24 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl-glow animate-float">
            <Truck size={48} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-neutral-text-primary mb-2 animate-fade-in-up animate-stagger-1">
            PlatePal Delivery
          </h1>
          <p className="text-neutral-text-secondary text-base animate-fade-in-up animate-stagger-2">
            Login to start delivering
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 animate-fade-in-up animate-stagger-3">
          {/* Email Input with Floating Label */}
          <div className="relative">
            <div className="relative">
              <Mail 
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
                  emailFocused || email ? 'text-primary scale-110' : 'text-neutral-text-secondary'
                }`} 
                size={20} 
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                placeholder=" "
                className="w-full pl-12 pr-4 py-4 border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white/50 backdrop-blur-sm text-neutral-text-primary font-medium touch-target-large placeholder-transparent"
                disabled={loading}
                aria-label="Email address"
                aria-required="true"
              />
              <label
                className={`absolute left-12 transition-all duration-300 pointer-events-none ${
                  emailFocused || email
                    ? 'top-2 text-xs text-primary font-semibold'
                    : 'top-1/2 -translate-y-1/2 text-base text-neutral-text-secondary'
                }`}
              >
                Email
              </label>
            </div>
          </div>

          {/* Password Input with Floating Label and Toggle */}
          <div className="relative">
            <div className="relative">
              <Lock 
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
                  passwordFocused || password ? 'text-primary scale-110' : 'text-neutral-text-secondary'
                }`} 
                size={20} 
              />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                placeholder=" "
                className="w-full pl-12 pr-12 py-4 border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white/50 backdrop-blur-sm text-neutral-text-primary font-medium touch-target-large placeholder-transparent"
                disabled={loading}
                aria-label="Password"
                aria-required="true"
              />
              <label
                className={`absolute left-12 transition-all duration-300 pointer-events-none ${
                  passwordFocused || password
                    ? 'top-2 text-xs text-primary font-semibold'
                    : 'top-1/2 -translate-y-1/2 text-base text-neutral-text-secondary'
                }`}
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-text-secondary hover:text-primary transition-colors p-1 touch-target"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Submit Button with Loading Spinner */}
          <button
            type="submit"
            disabled={loading}
            className="w-full gradient-primary text-white py-4 rounded-xl font-bold text-lg active:scale-[0.98] transition-all duration-300 touch-target-large shadow-xl hover:shadow-2xl-glow disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            aria-label="Login"
          >
            {loading ? (
              <>
                <div className="spinner" aria-hidden="true" />
                <span>Logging in...</span>
              </>
            ) : (
              <span>Login</span>
            )}
          </button>
        </form>

        {/* Test Credentials with Copy Button */}
        <div className="mt-8 p-4 bg-primary-light/50 backdrop-blur-sm rounded-xl border border-primary/20 animate-fade-in-up animate-stagger-4">
          <p className="text-sm font-semibold text-neutral-text-primary mb-2 text-center">
            Test Account
          </p>
          <div className="flex items-center justify-center gap-3">
            <code className="font-mono text-sm text-neutral-text-secondary flex-1 text-center">
              driver1@delivery.com / password123
            </code>
            <button
              onClick={handleCopyCredentials}
              className="p-2 rounded-lg bg-white/50 hover:bg-white/70 transition-colors touch-target"
              aria-label="Copy credentials"
              title="Copy credentials"
            >
              {copied ? (
                <Check size={18} className="text-success" />
              ) : (
                <Copy size={18} className="text-neutral-text-secondary" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

