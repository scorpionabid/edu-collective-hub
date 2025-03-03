
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { ApiMetric } from '@/lib/monitoring/types';

interface ApiMetricsChartProps {
  data: ApiMetric[];
  title: string;
  description?: string;
}

const ApiMetricsChart: React.FC<ApiMetricsChartProps> = ({ 
  data, 
  title, 
  description 
}) => {
  // Process the data to aggregate by endpoint
  const endpointData = React.useMemo(() => {
    const endpointMap = new Map<string, { count: number, avgDuration: number, successRate: number }>();
    
    data.forEach(metric => {
      const key = `${metric.method} ${metric.endpoint}`;
      const current = endpointMap.get(key) || { count: 0, avgDuration: 0, successRate: 0 };
      const isSuccess = (metric.statusCode || 0) < 400;
      
      // Update calculations
      const newCount = current.count + 1;
      const newAvgDuration = (current.avgDuration * current.count + metric.durationMs) / newCount;
      const newSuccessRate = ((current.successRate * current.count) + (isSuccess ? 100 : 0)) / newCount;
      
      endpointMap.set(key, {
        count: newCount,
        avgDuration: Math.round(newAvgDuration),
        successRate: Math.round(newSuccessRate)
      });
    });

    // Convert map to array and sort by average duration
    return Array.from(endpointMap.entries())
      .map(([name, stats]) => ({
        name: name.length > 25 ? name.substring(0, 22) + '...' : name,
        avgDuration: stats.avgDuration,
        successRate: stats.successRate,
        count: stats.count
      }))
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, 10); // Show only top 10 by duration
  }, [data]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={endpointData}
            margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45} 
              textAnchor="end" 
              height={70} 
              tick={{ fontSize: 12 }} 
            />
            <YAxis yAxisId="left" orientation="left" label={{ value: 'Avg Duration (ms)', angle: -90, position: 'insideLeft' }} />
            <YAxis yAxisId="right" orientation="right" label={{ value: 'Success Rate (%)', angle: 90, position: 'insideRight' }} />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'avgDuration') return [`${value} ms`, 'Avg Duration'];
                if (name === 'successRate') return [`${value}%`, 'Success Rate'];
                return [value, name];
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="avgDuration" fill="#8884d8" name="Avg Duration" />
            <Bar yAxisId="right" dataKey="successRate" fill="#82ca9d" name="Success Rate" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ApiMetricsChart;
