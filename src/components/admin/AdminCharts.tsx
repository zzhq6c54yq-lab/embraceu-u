import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import { TrendingUp, Activity, BarChart3 } from "lucide-react";
import type { ChartData } from "@/types/admin";

interface AdminChartsProps {
  chartData: ChartData;
}

const tooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  fontSize: '12px'
};

const AdminCharts = ({ chartData }: AdminChartsProps) => {
  return (
    <section className="mb-8">
      <h2 className="text-label mb-4 flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-primary" />
        ENGAGEMENT TRENDS (Last 14 Days)
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Signups Chart */}
        <div className="card-embrace p-4">
          <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            New Signups
          </h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.signupsByDay}>
                <defs>
                  <linearGradient id="signupGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#signupGradient)"
                  name="Signups"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Chart */}
        <div className="card-embrace p-4">
          <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-pink-500" />
            Daily Activity
          </h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.activityByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar dataKey="moods" fill="#ec4899" name="Moods" radius={[2, 2, 0, 0]} />
                <Bar dataKey="rituals" fill="#06b6d4" name="Rituals" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-pink-500" /> Moods
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-cyan-500" /> Rituals
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminCharts;
