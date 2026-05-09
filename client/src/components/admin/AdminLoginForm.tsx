import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { loginStart, loginSuccess, loginFailure } from '../../store/slices/adminAuthSlice';

export const AdminLoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state: any) => state.adminAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginStart());

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        dispatch(loginSuccess({ admin: data.admin, token: data.accessToken }));
        toast.success('Welcome to HeartSync Control Center');
        navigate('/admin/dashboard');
      } else {
        dispatch(loginFailure(data.message));
        toast.error(data.message || 'Login failed');
      }
    } catch (error) {
      dispatch(loginFailure('Connection error'));
      toast.error('Failed to connect to the server');
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-surface border border-border rounded-2xl shadow-2xl backdrop-blur-xl">
      <div className="flex flex-col items-center space-y-2">
        <div className="p-3 bg-primary/10 rounded-full">
          <ShieldCheck className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Admin Access</h1>
        <p className="text-sm text-text-secondary">Secure portal for system administrators</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary ml-1">Email Address</label>
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-background-alt border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-text-primary"
              placeholder="admin@heartsync.com"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary ml-1">Password</label>
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-background-alt border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-text-primary"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mt-2"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <span>Authorize Access</span>
          )}
        </button>
      </form>

      <div className="text-center">
        <p className="text-xs text-text-muted italic">
          Unauthorized access attempts are logged and monitored.
        </p>
      </div>
    </div>
  );
};
