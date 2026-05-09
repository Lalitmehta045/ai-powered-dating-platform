import { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Shield, 
  ChevronLeft, 
  ChevronRight,
  Info,
  Clock,
  Terminal,
  ArrowRight
} from 'lucide-react';
import { useGetAuditLogsQuery } from '../../store/api/adminAuditApi';

export const AuditLogHistory = () => {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  
  const { data, isLoading } = useGetAuditLogsQuery({ page, action: actionFilter });

  const getActionColor = (action: string) => {
    if (action.includes('BAN') || action.includes('REVOKE')) return 'text-red-500 bg-red-500/10 border-red-500/20';
    if (action.includes('GRANT') || action.includes('RESOLVE')) return 'text-green-500 bg-green-500/10 border-green-500/20';
    if (action.includes('LOGIN')) return 'text-primary bg-primary/10 border-primary/20';
    if (action.includes('BROADCAST')) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    return 'text-text-muted bg-white/5 border-border';
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Audit Trail</h1>
          <p className="text-text-secondary">Immutable history of all administrative actions and security events.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface border border-border rounded-2xl p-6 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search action type (e.g. USER_BAN)..." 
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full bg-background-alt border border-border rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-primary/50 text-text-primary transition-all"
          />
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-4 py-3 bg-background-alt border border-border rounded-xl text-sm font-bold flex items-center space-x-2 hover:bg-white/5 transition-all">
            <Calendar className="w-4 h-4" />
            <span>Last 30 Days</span>
          </button>
          <button className="px-4 py-3 bg-background-alt border border-border rounded-xl text-sm font-bold flex items-center space-x-2 hover:bg-white/5 transition-all">
            <Filter className="w-4 h-4" />
            <span>Advanced Filters</span>
          </button>
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-background-alt/50 border-b border-border">
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-widest">Timestamp</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-widest">Administrator</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-widest">Action</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-widest">Target</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-widest text-right">Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-text-muted animate-pulse">Scanning audit logs...</td>
                </tr>
              ) : data?.logs.map((log: any) => (
                <tr key={log._id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">{new Date(log.timestamp).toLocaleDateString()}</span>
                      <span className="text-[10px] text-text-muted flex items-center space-x-1">
                         <Clock className="w-3 h-3" />
                         <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{log.adminId?.name}</p>
                        <p className="text-[10px] text-text-muted uppercase font-black">{log.adminId?.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-text-muted">{log.targetType}:</span>
                      <span className="font-mono text-[11px] bg-background-alt px-1.5 py-0.5 rounded border border-border">
                        {log.targetId?.slice(-6) || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-primary/10 text-text-muted hover:text-primary rounded-lg transition-all group-hover:translate-x-1">
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-background-alt/30 border-t border-border flex items-center justify-between">
          <p className="text-sm text-text-muted">
            Displaying <span className="font-medium">{(page-1)*20 + 1}</span> - <span className="font-medium">{Math.min(page*20, data?.pagination.total || 0)}</span> of <span className="font-medium">{data?.pagination.total}</span> events
          </p>
          <div className="flex items-center space-x-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="p-2 border border-border rounded-lg hover:bg-white/5 disabled:opacity-50 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium">Page {page}</span>
            <button 
              disabled={page >= (data?.pagination.totalPages || 1)}
              onClick={() => setPage(p => p + 1)}
              className="p-2 border border-border rounded-lg hover:bg-white/5 disabled:opacity-50 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Security Tip */}
      <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 flex items-start space-x-4">
        <Shield className="w-6 h-6 text-primary mt-1" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-primary">Immutable Governance</h4>
          <p className="text-xs text-text-secondary leading-relaxed">
            Audit logs are append-only and cannot be modified or deleted by any administrative role, including Super Admins. 
            This ensures a tamper-proof history for compliance and internal security audits.
          </p>
        </div>
      </div>
    </div>
  );
};
