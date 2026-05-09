import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, Mail, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { GlassCard } from '../../components/ui/GlassCard';
import { useLoginMutation } from '../../store/api/authApi';
import { socketClient } from '../../socket/socketClient';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [login, { isLoading }] = useLoginMutation();

  const logoutToastShown = useRef(false);

  useEffect(() => {
    const state = location.state as any;
    if (state?.logoutSuccess && !logoutToastShown.current) {
      toast.success('Logged out successfully');
      logoutToastShown.current = true;
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data).unwrap();
      socketClient.connect(); // Connect socket manually after login
      navigate('/discover', { state: { loginSuccess: true } });
    } catch (err: any) {
      toast.error(err?.data?.message || 'Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/10 blur-[100px] pointer-events-none" />

      <Link to="/" className="mb-8 flex items-center gap-2 group z-10">
        <Heart className="w-10 h-10 text-primary fill-primary group-hover:scale-110 transition-transform" />
        <span className="text-3xl font-bold font-accent text-text-primary">HeartSync</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <GlassCard>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-2">Welcome back</h2>
            <p className="text-text-secondary">Enter your details to sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="name@example.com"
              icon={<Mail className="w-5 h-5" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={<Lock className="w-5 h-5" />}
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex justify-end">
              <a href="#" className="text-sm font-medium text-primary hover:text-primary-hover transition-colors">
                Forgot password?
              </a>
            </div>

            <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
              Sign In <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-text-secondary">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-text-primary hover:text-primary transition-colors">
              Sign up
            </Link>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};
