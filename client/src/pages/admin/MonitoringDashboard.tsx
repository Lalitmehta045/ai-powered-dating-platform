import { useState, useEffect } from 'react';
import { 
  Activity, 
  Server, 
  Database, 
  Zap, 
  Cpu, 
  HardDrive, 
  Users, 
  Clock,
  ShieldCheck,
  AlertCircle,
  Wifi,
  WifiOff
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { useAdminMonitoring } from '../../hooks/useAdminMonitoring';
import type { ServerHealth } from '../../hooks/useAdminMonitoring';
import { useGetHealthSnapshotQuery } from '../../store/api/adminMonitoringApi';

export const MonitoringDashboard = () => {
  const { health: realtimeHealth, isConnected } = useAdminMonitoring();
  const { data: initialSnapshot } = useGetHealthSnapshotQuery();
  const [latencyHistory, setLatencyHistory] = useState<any[]>([]);
  const [memoryHistory, setMemoryHistory] = useState<any[]>([]);

  const activeHealth = realtimeHealth || initialSnapshot?.data;

  useEffect(() => {
    if (activeHealth) {
      const time = new Date(activeHealth.timestamp).toLocaleTimeString();
      
      setLatencyHistory(prev => {
        const next = [...prev, { time, latency: activeHealth.metrics.avgLatency }];
        return next.slice(-20); // Keep last 20 samples
      });

      setMemoryHistory(prev => {
        const next = [...prev, { time, used: activeHealth.resources.memoryUsed }];
        return next.slice(-20);
      });
    }
  }, [activeHealth]);

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">System Monitoring</h1>
          <p className="text-text-secondary">Real-time infrastructure health and performance telemetry.</p>
        </div>
        <div className={`flex items-center space-x-3 px-4 py-2 rounded-2xl border ${
          isConnected ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
        }`}>
          {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          <span className="text-xs font-bold uppercase tracking-widest">
            {isConnected ? 'Live Sync Active' : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Health Pulse Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface border border-border rounded-2xl p-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest">MongoDB</p>
            <h4 className={`text-lg font-bold flex items-center space-x-2 ${
              activeHealth?.services.mongodb === 'connected' ? 'text-green-500' : 'text-red-500'
            }`}>
              <Database className="w-4 h-4" />
              <span>{activeHealth?.services.mongodb}</span>
            </h4>
          </div>
          <div className={`w-3 h-3 rounded-full animate-pulse ${
            activeHealth?.services.mongodb === 'connected' ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.5)]' : 'bg-red-500'
          }`} />
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Redis Cache</p>
            <h4 className={`text-lg font-bold flex items-center space-x-2 ${
              activeHealth?.services.redis === 'connected' ? 'text-blue-500' : 'text-red-500'
            }`}>
              <Zap className="w-4 h-4" />
              <span>{activeHealth?.services.redis}</span>
            </h4>
          </div>
          <div className={`w-3 h-3 rounded-full animate-pulse ${
            activeHealth?.services.redis === 'connected' ? 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]' : 'bg-red-500'
          }`} />
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Active Sockets</p>
            <h4 className="text-lg font-bold flex items-center space-x-2 text-primary">
              <Users className="w-4 h-4" />
              <span>{activeHealth?.metrics.activeConnections || 0}</span>
            </h4>
          </div>
          <div className="w-3 h-3 rounded-full animate-pulse bg-primary shadow-[0_0_12px_rgba(255,77,109,0.5)]" />
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Server Uptime</p>
            <h4 className="text-lg font-bold flex items-center space-x-2 text-text-primary">
              <Clock className="w-4 h-4" />
              <span className="tabular-nums">{activeHealth ? formatUptime(activeHealth.uptime) : '---'}</span>
            </h4>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* API Latency Graph */}
        <div className="bg-surface border border-border rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-bold">API Latency Wave</h3>
            </div>
            <span className="text-2xl font-black text-green-500 tabular-nums">
              {activeHealth?.metrics.avgLatency}ms
            </span>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={latencyHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A35" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis stroke="#B0B3C0" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#18181F', border: '1px solid #2A2A35', borderRadius: '12px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="latency" 
                  stroke="#22C55E" 
                  strokeWidth={3} 
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Memory Usage Graph */}
        <div className="bg-surface border border-border rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <HardDrive className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold">Memory Pulse</h3>
            </div>
            <span className="text-2xl font-black text-primary tabular-nums">
              {activeHealth?.resources.memoryUsed}MB
            </span>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={memoryHistory}>
                <defs>
                  <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF4D6D" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF4D6D" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A35" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis stroke="#B0B3C0" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#18181F', border: '1px solid #2A2A35', borderRadius: '12px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="used" 
                  stroke="#FF4D6D" 
                  fill="url(#colorMemory)"
                  strokeWidth={3} 
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center space-x-2 text-text-muted">
            <Cpu className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Process Load</span>
          </div>
          <div className="flex items-end space-x-2">
            <span className="text-4xl font-black tabular-nums">{activeHealth?.resources.cpuLoad}</span>
            <span className="text-sm text-text-muted pb-1">avg/min</span>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center space-x-2 text-text-muted">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            <span className="text-xs font-bold uppercase tracking-widest">Security Engine</span>
          </div>
          <div className="flex items-center space-x-2 text-green-500">
             <span className="text-lg font-bold">Standard Shield Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
