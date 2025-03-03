
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format } from 'date-fns';
import { ApiMetric } from '@/lib/monitoring/types';

interface ApiMetricsChartProps {
  data: ApiMetric[];
  title?: string;
  description?: string;
}

export function ApiMetricsChart({ 
  data, 
  title = "API Performance Metrics", 
  description 
}: ApiMetricsChartProps) {
  // Format data for the chart
  const chartData = data.map(metric => ({
    ...metric,
    timestamp: metric.timestamp ? format(new Date(metric.timestamp), 'HH:mm') : '',
    duration: metric.duration_ms,
    endpoint: metric.endpoint.split('/').slice(-1)[0] || metric.endpoint, // Get last part of path for cleaner display
  }));

  // Group data by endpoint for the bar chart
  const endpointData = React.useMemo(() => {
    const groupedByEndpoint: Record<string, { endpoint: string, avgDuration: number, count: number }> = {};
    
    data.forEach(metric => {
      const endpoint = metric.endpoint.split('/').slice(-1)[0] || metric.endpoint;
      if (!groupedByEndpoint[endpoint]) {
        groupedByEndpoint[endpoint] = { 
          endpoint, 
          avgDuration: 0, 
          count: 0 
        };
      }
      
      groupedByEndpoint[endpoint].avgDuration += metric.duration_ms;
      groupedByEndpoint[endpoint].count++;
    });
    
    // Calculate averages and convert to array
    return Object.values(groupedByEndpoint).map(item => ({
      ...item,
      avgDuration: Math.round(item.avgDuration / item.count)
    }));
  }, [data]);

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>API Response Times</CardTitle>
          <CardDescription>Response time in milliseconds over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value} ms`, 'Response Time']}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Legend />
              <Line type="monotone" dataKey="duration" stroke="#8884d8" activeDot={{ r: 8 }} name="Response Time" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Average Response Time by Endpoint</CardTitle>
          <CardDescription>Average response time in milliseconds for each endpoint</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={endpointData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="endpoint" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value} ms`, 'Avg Response Time']}
              />
              <Legend />
              <Bar dataKey="avgDuration" fill="#82ca9d" name="Avg Response Time" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
