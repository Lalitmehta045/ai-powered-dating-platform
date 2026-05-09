import { useState } from 'react';
import { 
  Flag, 
  User, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  MoreVertical,
  Clock,
  ShieldAlert,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { useGetReportsQuery, useResolveReportMutation } from '../../store/api/adminReportsApi';
import { toast } from 'react-hot-toast';

export const ModerationQueue = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [reasonFilter, setReasonFilter] = useState('');

  const { data, isLoading, isFetching } = useGetReportsQuery({
    page,
    status: statusFilter,
    reason: reasonFilter,
  });

  const [resolveReport] = useResolveReportMutation();

  const handleAction = async (reportId: string, action: string, suspensionDays?: number) => {
    try {
      await resolveReport({ id: reportId, action, suspensionDays }).unwrap();
      toast.success(`Report ${action}ed successfully`);
    } catch (err) {
      toast.error('Failed to process moderation action');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Moderation Queue</h1>
          <p className="text-text-secondary">Review user reports and maintain platform safety.</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-4 bg-surface p-4 border border-border rounded-2xl">
        <div className="flex items-center space-x-2 bg-background-alt border border-border rounded-xl px-3 py-1.5">
          <Filter className="w-4 h-4 text-text-muted" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-sm text-text-primary focus:outline-none"
          >
            <option value="pending">Pending Review</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>

        <select 
          value={reasonFilter}
          onChange={(e) => setReasonFilter(e.target.value)}
          className="bg-background-alt border border-border rounded-xl px-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">All Reasons</option>
          <option value="fake_profile">Fake Profile</option>
          <option value="spam">Spam</option>
          <option value="harassment">Harassment</option>
          <option value="offensive_content">Offensive Content</option>
        </select>
      </div>

      {/* Reports Grid */}
      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {data?.reports.length === 0 ? (
            <div className="bg-surface border border-border rounded-2xl p-12 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4 opacity-50" />
              <p className="text-text-secondary">Clear skies! No pending reports to review.</p>
            </div>
          ) : data?.reports.map((report: any) => (
            <div key={report._id} className="bg-surface border border-border rounded-2xl overflow-hidden hover:border-primary/20 transition-all">
              <div className="p-6 space-y-6">
                {/* User Info Header */}
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-12">
                    {/* Reporter */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Reporter</p>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                          <User className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">{report.reporterId?.name}</p>
                          <p className="text-xs text-text-muted truncate max-w-[150px]">{report.reporterId?.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="hidden sm:flex items-center justify-center h-10 pt-4">
                      <ChevronRight className="w-6 h-6 text-border" />
                    </div>
                    <div className="sm:hidden flex justify-center py-1">
                       <ChevronLeft className="w-4 h-4 text-border rotate-270" />
                    </div>

                    {/* Target User */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Reported User</p>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20">
                          <ShieldAlert className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">{report.targetUserId?.name}</p>
                          <p className="text-xs text-red-500/70 font-semibold">{report.targetUserId?.reportCount} total reports</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-start lg:items-end space-y-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      report.reason === 'harassment' ? 'bg-red-500/10 text-red-500' :
                      'bg-amber-500/10 text-amber-500'
                    }`}>
                      {report.reason.replace('_', ' ')}
                    </span>
                    <p className="text-xs text-text-muted">{new Date(report.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-background-alt/50 border border-border p-4 rounded-xl">
                  <p className="text-sm text-text-primary italic leading-relaxed">
                    "{report.description || 'No detailed description provided.'}"
                  </p>
                </div>

                {/* Actions Bar */}
                {report.status === 'pending' && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border">
                    <div className="flex items-center space-x-3 w-full sm:w-auto">
                      <button 
                        onClick={() => handleAction(report._id, 'dismiss')}
                        className="flex-1 sm:flex-none px-4 py-2 border border-border rounded-xl text-sm font-bold hover:bg-white/5 transition-all"
                      >
                        Dismiss
                      </button>
                      <button 
                         onClick={() => handleAction(report._id, 'warn')}
                        className="flex-1 sm:flex-none px-4 py-2 bg-amber-500/10 text-amber-500 rounded-xl text-sm font-bold hover:bg-amber-500/20 transition-all"
                      >
                        Warn
                      </button>
                    </div>
                    <div className="flex items-center space-x-3 w-full sm:w-auto">
                      <button 
                        onClick={() => handleAction(report._id, 'suspend', 7)}
                        className="flex-1 sm:flex-none px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm font-bold hover:bg-primary/20 transition-all flex items-center justify-center space-x-2"
                      >
                        <Clock className="w-4 h-4" />
                        <span>7d</span>
                      </button>
                      <button 
                        onClick={() => handleAction(report._id, 'ban')}
                        className="flex-[2] sm:flex-none px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                      >
                        Ban permanently
                      </button>
                    </div>
                  </div>
                )}

                {report.status !== 'pending' && (
                  <div className="flex items-center space-x-2 pt-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-xs font-bold text-text-muted uppercase">
                      Resolved as {report.actionTaken}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && data?.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-4 pt-8">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="p-2 border border-border rounded-lg hover:bg-white/5 disabled:opacity-50 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium">Page {page} of {data?.pagination.totalPages}</span>
          <button 
            disabled={page >= data?.pagination.totalPages}
            onClick={() => setPage(p => p + 1)}
            className="p-2 border border-border rounded-lg hover:bg-white/5 disabled:opacity-50 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
