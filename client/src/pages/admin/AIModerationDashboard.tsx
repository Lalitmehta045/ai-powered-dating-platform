import { 
  Bot, 
  ShieldAlert, 
  MessageSquare, 
  AlertCircle,
  TrendingDown,
  ExternalLink,
  ShieldCheck,
  Zap,
  Loader2,
  MoreVertical,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { useGetFlaggedContentQuery, useGetSuspiciousUsersQuery } from '../../store/api/adminAIApi';

export const AIModerationDashboard = () => {
  const { data: flags, isLoading: isFlagsLoading } = useGetFlaggedContentQuery();
  const { data: users, isLoading: isUsersLoading } = useGetSuspiciousUsersQuery();

  if (isFlagsLoading || isUsersLoading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-text-secondary animate-pulse font-medium">HeartSync Sentinel is scanning for threats...</p>
        </div>
      </div>
    );
  }

  const flaggedItems = flags?.data || [];
  const suspiciousUsers = users?.data || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h1 className="text-3xl font-bold tracking-tight">AI Sentinel</h1>
            <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-md tracking-widest border border-primary/20">Beta</span>
          </div>
          <p className="text-text-secondary">Proactive threat detection and automated moderation insights.</p>
        </div>
        <div className="flex items-center space-x-3 bg-surface border border-border p-2 rounded-2xl">
          <Activity className="w-4 h-4 text-green-500" />
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider">AI Engines Active</span>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface border border-border rounded-2xl p-6 flex items-center space-x-4">
          <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
            <ShieldAlert className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Critical Flags</p>
            <h3 className="text-2xl font-bold">{flaggedItems.filter((i: any) => i.severity === 'high').length}</h3>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-6 flex items-center space-x-4">
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
            <Bot className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Active Scans</p>
            <h3 className="text-2xl font-bold">14,285</h3>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-6 flex items-center space-x-4">
          <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Avg Confidence</p>
            <h3 className="text-2xl font-bold">94.2%</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Flagged Content Feed */}
        <div className="bg-surface border border-border rounded-2xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h3 className="text-lg font-bold">Content Watchlist</h3>
            <span className="text-xs text-text-muted">{flaggedItems.length} alerts detected</span>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[600px] p-4 space-y-4">
            {flaggedItems.map((item: any, i: number) => (
              <div key={i} className="p-4 bg-background-alt border border-border rounded-xl space-y-3 hover:border-primary/20 transition-all group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {item.type === 'bio' ? <AlertCircle className="w-4 h-4 text-primary" /> : <MessageSquare className="w-4 h-4 text-amber-500" />}
                    <span className="text-xs font-bold uppercase tracking-widest text-text-muted">{item.type} Flag</span>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                    item.severity === 'high' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  }`}>
                    {item.severity} severity
                  </span>
                </div>
                <p className="text-sm italic text-text-primary leading-relaxed bg-surface/50 p-3 rounded-lg border border-border/50">
                  "{item.content}"
                </p>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold">
                      {item.user?.name?.charAt(0)}
                    </div>
                    <span className="text-xs font-semibold">{item.user?.name}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Confidence</p>
                      <p className="text-xs font-bold text-green-500">{(item.confidence * 100).toFixed(1)}%</p>
                    </div>
                    <button className="p-2 hover:bg-primary/10 text-text-muted hover:text-primary rounded-lg transition-all">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suspicious Users List */}
        <div className="bg-surface border border-border rounded-2xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h3 className="text-lg font-bold">High Risk Profiles</h3>
            <button className="text-xs text-primary font-bold hover:underline">View All</button>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[600px]">
            <table className="w-full text-left">
              <thead className="bg-background-alt/50 border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-[10px] font-bold text-text-muted uppercase">User</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-text-muted uppercase text-center">Risk Score</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-text-muted uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {suspiciousUsers.map((user: any) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center border border-border group-hover:border-primary/30">
                          <span className="text-xs font-bold">{user.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold truncate max-w-[120px]">{user.name}</p>
                          <p className="text-[10px] text-text-muted truncate max-w-[120px]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center">
                        <div className="w-full bg-background-alt h-1.5 rounded-full overflow-hidden border border-border max-w-[80px]">
                          <div 
                            className={`h-full rounded-full ${user.riskScore > 0.7 ? 'bg-red-500' : 'bg-amber-500'}`} 
                            style={{ width: `${user.riskScore * 100}%` }}
                          />
                        </div>
                        <span className={`text-[10px] font-black mt-1 ${user.riskScore > 0.7 ? 'text-red-500' : 'text-amber-500'}`}>
                          {(user.riskScore * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-primary/10 text-text-muted hover:text-primary rounded-lg transition-all">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
