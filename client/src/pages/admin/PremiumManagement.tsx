import { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  CreditCard,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Zap,
  Calendar,
  Loader2,
  ArrowUpRight,
  Target
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  useGetRevenueDashboardQuery, 
  useGetPremiumUsersQuery 
} from '../../store/api/adminPremiumApi';

export const PremiumManagement = () => {
  const [page, setPage] = useState(1);
  const { data: dashboard, isLoading: isDashboardLoading } = useGetRevenueDashboardQuery();
  const { data: usersData, isLoading: isUsersLoading } = useGetPremiumUsersQuery({ page });

  if (isDashboardLoading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  const stats = dashboard?.data?.overview;
  const trends = dashboard?.data?.trends || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Premium Management</h1>
          <p className="text-text-secondary">Track revenue, subscriptions, and customer lifecycle.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
            <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-full">+12.5%</span>
          </div>
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Total Revenue</p>
            <h3 className="text-2xl font-bold">₹{stats?.totalRevenue.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
              <Users className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Active Subscriptions</p>
            <h3 className="text-2xl font-bold">{stats?.totalPremiumUsers}</h3>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <Target className="w-6 h-6 text-amber-500" />
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Conversion Rate</p>
            <h3 className="text-2xl font-bold">{stats?.conversionRate}%</h3>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <CreditCard className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Monthly / Yearly</p>
            <h3 className="text-2xl font-bold">{stats?.monthlySubs} / {stats?.yearlySubs}</h3>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-surface border border-border rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Revenue Trends</h3>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary rounded-full" />
            <span className="text-xs text-text-secondary">Gross Revenue (INR)</span>
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trends}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF4D6D" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF4D6D" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A35" vertical={false} />
              <XAxis dataKey="month" stroke="#B0B3C0" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#B0B3C0" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181F', border: '1px solid #2A2A35', borderRadius: '12px' }}
                itemStyle={{ color: '#FFFFFF' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#FF4D6D" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Premium Users Table */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="text-lg font-bold">Premium Subscriber Directory</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-background-alt/50 border-b border-border">
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase">Subscriber</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase">Plan Type</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase">Expiry Date</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isUsersLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                  </td>
                </tr>
              ) : usersData?.users.map((user: any) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                        {user.photos?.[0] ? (
                          <img src={user.photos[0]} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <span className="text-primary font-bold">{user.name.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-xs text-text-muted">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                      user.subscriptionType === 'yearly' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
                    }`}>
                      {user.subscriptionType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {new Date(user.premiumExpiresAt).toLocaleDateString()}
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

        {/* Pagination */}
        <div className="px-6 py-4 bg-background-alt/30 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-muted text-center sm:text-left">
            Showing <span className="font-medium">{(page-1)*10 + 1}</span> to <span className="font-medium">{Math.min(page*10, usersData?.pagination.total || 0)}</span> subscribers
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
              disabled={page >= (usersData?.pagination.totalPages || 1)}
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
