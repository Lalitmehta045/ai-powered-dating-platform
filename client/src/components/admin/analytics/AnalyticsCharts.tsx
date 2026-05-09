import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

const COLORS = ['#FF4D6D', '#7B61FF', '#22C55E', '#FFB800', '#00CFE8'];

export const UserGrowthChart = ({ data }: { data: any[] }) => (
  <div className="h-[300px] w-full min-h-[300px]">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FF4D6D" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#FF4D6D" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#2A2A35" vertical={false} />
        <XAxis 
          dataKey="date" 
          stroke="#B0B3C0" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
          tickFormatter={(str) => str.split('-').slice(1).join('/')}
        />
        <YAxis stroke="#B0B3C0" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip 
          contentStyle={{ backgroundColor: '#18181F', border: '1px solid #2A2A35', borderRadius: '12px' }}
          itemStyle={{ color: '#FFFFFF' }}
        />
        <Area type="monotone" dataKey="swipes" stroke="#FF4D6D" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export const GenderPieChart = ({ data }: { data: any[] }) => (
  <div className="h-[300px] w-full min-h-[300px]">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ backgroundColor: '#18181F', border: '1px solid #2A2A35', borderRadius: '12px' }}
          itemStyle={{ color: '#FFFFFF' }}
        />
        <Legend verticalAlign="bottom" height={36}/>
      </PieChart>
    </ResponsiveContainer>
  </div>
);

export const EngagementChart = ({ swipes, matches }: { swipes: any[], matches: any[] }) => {
  // Merge data for the chart
  const data = swipes.map(s => ({
    date: s.date,
    swipes: s.swipes,
    matches: matches.find(m => m.date === s.date)?.matches || 0
  }));

  return (
    <div className="h-[300px] w-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A2A35" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#B0B3C0" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(str) => str.split('-').slice(1).join('/')}
          />
          <YAxis stroke="#B0B3C0" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#18181F', border: '1px solid #2A2A35', borderRadius: '12px' }}
            itemStyle={{ color: '#FFFFFF' }}
          />
          <Legend />
          <Bar dataKey="swipes" fill="#FF4D6D" radius={[4, 4, 0, 0]} />
          <Bar dataKey="matches" fill="#7B61FF" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
