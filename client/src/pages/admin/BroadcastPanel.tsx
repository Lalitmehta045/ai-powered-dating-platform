import { useState } from 'react';
import { 
  Megaphone, 
  Send, 
  Users, 
  Eye, 
  Target, 
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info
} from 'lucide-react';
import { useSendBroadcastMutation } from '../../store/api/adminBroadcastApi';

export const BroadcastPanel = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('all');
  const [preview, setPreview] = useState(false);
  
  const [sendBroadcast, { isLoading, isSuccess, isError, error }] = useSendBroadcastMutation();

  const handleSend = async () => {
    if (!title || !message) return;
    try {
      await sendBroadcast({ title, message, target }).unwrap();
      setTitle('');
      setMessage('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Broadcast Center</h1>
          <p className="text-text-secondary">Send instant announcements to your users.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Composer */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface border border-border rounded-2xl p-8 space-y-6">
            <div className="flex items-center space-x-2 text-primary">
              <Megaphone className="w-5 h-5" />
              <h3 className="text-lg font-bold">New Announcement</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-text-muted uppercase tracking-widest">Notification Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Weekly Premium Discount!"
                  className="w-full bg-background-alt border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 text-text-primary transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-text-muted uppercase tracking-widest">Message Content</label>
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell your users something important..."
                  rows={5}
                  className="w-full bg-background-alt border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 text-text-primary transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-muted uppercase tracking-widest flex items-center space-x-2">
                    <Target className="w-4 h-4" />
                    <span>Target Audience</span>
                  </label>
                  <select 
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    className="w-full bg-background-alt border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 text-text-primary transition-all"
                  >
                    <option value="all">All Users</option>
                    <option value="premium">Premium Only</option>
                    <option value="free">Free Users Only</option>
                    <option value="male">Male Users</option>
                    <option value="female">Female Users</option>
                  </select>
                </div>
                
                <div className="flex items-end">
                   <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl flex items-start space-x-3 w-full">
                      <Info className="w-4 h-4 text-primary mt-0.5" />
                      <p className="text-[11px] text-text-secondary leading-relaxed">
                        Broadcasts are sent via WebSockets for active users and saved as in-app notifications for offline users.
                      </p>
                   </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button 
                onClick={() => setPreview(!preview)}
                className="flex items-center space-x-2 text-sm font-bold text-text-muted hover:text-text-primary transition-all"
              >
                <Eye className="w-4 h-4" />
                <span>{preview ? 'Hide Preview' : 'Show Preview'}</span>
              </button>
              <button 
                disabled={!title || !message || isLoading}
                onClick={handleSend}
                className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-bold flex items-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Transmit Broadcast</span>
              </button>
            </div>

            {isSuccess && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center space-x-3 text-green-500">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-bold">Broadcast transmitted successfully!</span>
              </div>
            )}

            {isError && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center space-x-3 text-red-500">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-bold">Transmission failed. Please try again.</span>
              </div>
            )}
          </div>
        </div>

        {/* Preview / Instructions */}
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-2xl p-6 space-y-6">
             <div className="flex items-center space-x-2 text-text-muted">
                <Smartphone className="w-5 h-5" />
                <h3 className="text-lg font-bold">Mobile Preview</h3>
             </div>
             
             {/* Preview Mockup */}
             <div className="relative mx-auto w-[240px] h-[480px] bg-background-alt border-[6px] border-surface-alt rounded-[40px] overflow-hidden shadow-2xl">
                <div className="absolute top-0 w-full h-6 bg-surface-alt flex justify-center items-end">
                   <div className="w-16 h-4 bg-black rounded-b-xl" />
                </div>
                
                <div className="p-4 pt-12 space-y-4">
                   <div className="p-3 bg-white/5 border border-white/10 rounded-2xl animate-bounce shadow-xl">
                      <div className="flex items-center space-x-2 mb-1">
                         <div className="w-4 h-4 bg-primary rounded flex items-center justify-center">
                            <span className="text-[8px] font-black text-white">H</span>
                         </div>
                         <span className="text-[10px] font-bold">HeartSync</span>
                         <span className="text-[8px] text-text-muted ml-auto">now</span>
                      </div>
                      <p className="text-[11px] font-black leading-tight mb-0.5">{title || 'Your Title Here'}</p>
                      <p className="text-[10px] text-text-muted leading-relaxed line-clamp-2">
                        {message || 'Your broadcast message will appear here...'}
                      </p>
                   </div>
                </div>
                
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-20 h-1 bg-white/20 rounded-full" />
             </div>
             
             <div className="space-y-4 bg-background-alt/50 p-4 rounded-xl border border-border">
                <div className="flex items-center space-x-2">
                   <Users className="w-4 h-4 text-text-muted" />
                   <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Reach Estimate</span>
                </div>
                <div className="flex items-baseline space-x-1">
                   <span className="text-2xl font-black">{target === 'all' ? '12,485' : target === 'premium' ? '1,240' : '8,420'}</span>
                   <span className="text-xs text-text-muted">Users</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
