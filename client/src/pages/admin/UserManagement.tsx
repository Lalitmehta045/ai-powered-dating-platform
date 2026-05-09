import { useState } from 'react';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  MoreVertical, 
  UserX, 
  Clock, 
  Zap, 
  ShieldAlert,
  Eye,
  Mail,
  Calendar,
  Loader2
} from 'lucide-react';
import { 
  useGetUsersQuery, 
  useUpdateUserStatusMutation, 
  useToggleUserPremiumMutation 
} from '../../store/api/adminUsersApi';
import { toast } from 'react-hot-toast';

export const UserManagement = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');

  const { data, isLoading, isFetching } = useGetUsersQuery({
    page,
    search,
    status: statusFilter,
    gender: genderFilter,
  });

  const [updateStatus] = useUpdateUserStatusMutation();
  const [togglePremium] = useToggleUserPremiumMutation();

  const handleStatusChange = async (userId: string, status: string) => {
    try {
      await updateStatus({ id: userId, status }).unwrap();
      toast.success(`User marked as ${status}`);
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  const handlePremiumToggle = async (userId: string, currentStatus: boolean) => {
    try {
      await togglePremium({ id: userId, isPremium: !currentStatus }).unwrap();
      toast.success(`Premium status updated`);
    } catch (err) {
      toast.error('Failed to update premium status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">User Directory</h1>
          <p className="text-text-secondary">Manage matches, moderation, and system access.</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 bg-surface p-4 border border-border rounded-2xl">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background-alt border border-border rounded-xl pl-10 pr-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="flex items-center space-x-2 w-full lg:w-auto">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 lg:flex-none bg-background-alt border border-border rounded-xl px-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>

          <select 
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="flex-1 lg:flex-none bg-background-alt border border-border rounded-xl px-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-background-alt/50 border-b border-border">
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Access</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider hidden sm:table-cell">Created</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                  </td>
                </tr>
              ) : data?.users.map((user: any) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/20 shrink-0">
                        {user.photos?.[0] ? (
                          <img src={user.photos[0]} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <span className="text-primary font-bold">{user.name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="truncate max-w-[120px] sm:max-w-none">
                        <p className="font-semibold text-text-primary truncate">{user.name}</p>
                        <p className="text-xs text-text-muted truncate">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                      user.status === 'active' ? 'bg-green-500/10 text-green-500' :
                      user.status === 'suspended' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Zap className={`w-4 h-4 shrink-0 ${user.isPremium ? 'text-amber-500' : 'text-text-muted'}`} />
                      <span className="text-sm hidden sm:inline">{user.isPremium ? 'Premium' : 'Free'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-muted hidden sm:table-cell">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-1 sm:space-x-2">
                      <button 
                        onClick={() => handlePremiumToggle(user.id, user.isPremium)}
                        className="p-1.5 sm:p-2 hover:bg-amber-500/10 text-text-muted hover:text-amber-500 rounded-lg transition-all"
                        title="Toggle Premium"
                      >
                        <Zap className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleStatusChange(user.id, user.status === 'active' ? 'suspended' : 'active')}
                        className="p-1.5 sm:p-2 hover:bg-amber-500/10 text-text-muted hover:text-amber-500 rounded-lg transition-all"
                        title={user.status === 'active' ? 'Suspend' : 'Activate'}
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                      <button 
                         onClick={() => handleStatusChange(user.id, 'banned')}
                         className="p-1.5 sm:p-2 hover:bg-red-500/10 text-text-muted hover:text-red-500 rounded-lg transition-all"
                         title="Ban User"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-background-alt/30 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-muted text-center sm:text-left">
            Showing <span className="font-medium">{(page-1)*10 + 1}</span> to <span className="font-medium">{Math.min(page*10, data?.pagination.total || 0)}</span> of <span className="font-medium">{data?.pagination.total || 0}</span> users
          </p>
          <div className="flex items-center space-x-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="p-2 border border-border rounded-lg hover:bg-white/5 disabled:opacity-50 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium px-4">Page {page}</span>
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
    </div>
  );
};
