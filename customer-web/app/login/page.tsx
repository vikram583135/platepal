'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiService } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { ArrowLeft, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.login(email, password);
      // Handle both accessToken and token field names
      const token = response.accessToken || response.token;
      const userData = response.user || { email, name: email.split('@')[0] };
      setAuth(token, userData);
      toast.success('Welcome back! 🎉');
      router.push('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-primary flex flex-col">
      {/* Header */}
      <div className="p-4 animate-slide-down">
        <button
          onClick={() => router.back()}
          className="text-white p-2 hover:bg-white/10 rounded-full active:scale-95 transition-all"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 shadow-floating max-w-md w-full animate-scale-in">
          <h1 className="text-3xl font-bold text-center mb-2 text-neutral-text-primary">Welcome Back</h1>
          <p className="text-neutral-text-secondary text-center mb-8">Login to your account</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="animate-slide-up">
              <label className="block text-sm font-semibold text-neutral-text-primary mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-text-secondary" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full pl-10 pr-4 py-3 border-2 border-neutral-border rounded-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
              <label className="block text-sm font-semibold text-neutral-text-primary mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-text-secondary" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 border-2 border-neutral-border rounded-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-primary text-white py-3 rounded-md font-semibold active:scale-95 transition-all touch-target disabled:opacity-50 shadow-md hover-lift animate-slide-up"
              style={{ animationDelay: '200ms' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <div className="mt-6 text-center animate-fade-in">
            <p className="text-neutral-text-secondary">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-primary font-semibold hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

