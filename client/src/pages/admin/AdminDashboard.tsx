import { 
  Users, 
  Zap, 
  Heart, 
  MessageSquare, 
  TrendingUp, 
  Activity,
  ArrowUpRight,
  Loader2
} from 'lucide-react';
import { StatCard } from '../../components/admin/analytics/StatCard';
import { 
  UserGrowthChart, 
  GenderPieChart, 
  EngagementChart 
} from '../../components/admin/analytics/AnalyticsCharts';
import { 
  useGetOverviewAnalyticsQuery, 
  useGetRealtimeAnalyticsQuery 
} from '../../store/api/adminAnalyticsApi';

export const AdminDashboard = () => {
  const { data: overview, isLoading: isOverviewLoading } = useGetOverviewAnalyticsQuery();
  const { data: realtime, isLoading: isRealtimeLoading } = useGetRealtimeAnalyticsQuery(undefined, {
    pollingInterval: 30000, // Poll every 30 seconds
  });

  if (isOverviewLoading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-text-secondary animate-pulse">Aggregating system intelligence...</p>
        </div>
      </div>
    );
  }

  const stats = overview?.data;
  const realtimeStats = realtime?.data;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Intelligence Overview</h1>
          <p className="text-text-secondary">Real-time system metrics and platform health.</p>
        </div>
        <div className="flex items-center space-x-2 bg-surface border border-border p-1.5 rounded-xl">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider pr-2">System Live</span>
        </div>
      </div>

      {/* Real-time Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Users" 
          value={stats?.overview?.totalUsers || 0} 
          change="+12.5%" 
          icon={Users} 
          color="bg-blue-500" 
        />
        <StatCard 
          label="Premium Users" 
          value={stats?.overview?.premiumUsers || 0} 
          change={`${stats?.overview?.premiumConversionRate || 0}% rate`} 
          icon={Zap} 
          color="bg-amber-500" 
        />
        <StatCard 
          label="Online Now" 
          value={realtimeStats?.onlineUsers || 0} 
          icon={Activity} 
          color="bg-green-500" 
        />
        <StatCard 
          label="Daily Swipes" 
          value={realtimeStats?.swipesToday || 0} 
          change="+5.2%" 
          icon={Heart} 
          color="bg-pink-500" 
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-surface border border-border rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Engagement (Last 30 Days)</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-primary rounded-full" />
                <span className="text-xs text-text-secondary">Swipes</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-secondary rounded-full" />
                <span className="text-xs text-text-secondary">Matches</span>
              </div>
            </div>
          </div>
          <EngagementChart 
            swipes={stats?.engagement?.swipes || []} 
            matches={stats?.engagement?.matches || []} 
          />
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 space-y-6">
          <h3 className="text-lg font-bold">Gender Distribution</h3>
          <GenderPieChart data={stats?.genderDistribution || []} />
          <div className="grid grid-cols-2 gap-4 pt-4">
            {stats?.genderDistribution?.map((item: any, i: number) => (
              <div key={item.name} className="flex flex-col">
                <span className="text-xs text-text-muted uppercase font-bold">{item.name}</span>
                <span className="text-lg font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-surface border border-border rounded-2xl p-6 space-y-6">
          <h3 className="text-lg font-bold">System Activity Heatmap</h3>
          <UserGrowthChart data={stats?.engagement?.swipes || []} />
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold">Performance Summary</h3>
            <p className="text-text-secondary max-w-xs mx-auto">
              Platform engagement is up 18% compared to last week. Match efficiency is at an all-time high.
            </p>
          </div>
          <button className="px-6 py-2 bg-primary/10 text-primary rounded-xl font-bold flex items-center space-x-2 hover:bg-primary/20 transition-all mt-4">
            <span>Download Report</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
