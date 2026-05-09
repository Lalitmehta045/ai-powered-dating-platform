import { AdminLoginForm } from '../../components/admin/AdminLoginForm';

export const AdminLogin = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F0F13] relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      
      <div className="z-10 w-full flex justify-center px-4">
        <AdminLoginForm />
      </div>
      
      {/* Footer Branding */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <span className="text-text-muted text-sm font-medium tracking-widest uppercase opacity-50">
          HeartSync Admin v1.0.0
        </span>
      </div>
    </div>
  );
};
