
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface PerformanceMetric {
  timestamp: string;
  load_time_ms: number;
  ttfb_ms?: number;
  lcp_ms?: number;
  fid_ms?: number;
  cls_score?: number;
}

interface PerformanceMetricsChartProps {
  data: PerformanceMetric[];
  title: string;
  description?: string;
}

const PerformanceMetricsChart: React.FC<PerformanceMetricsChartProps> = ({ 
  data, 
  title, 
  description 
}) => {
  // Format data for the chart
  const chartData = data.map(metric => ({
    ...metric,
    timestamp: format(new Date(metric.timestamp), 'HH:mm'),
    loadTime: metric.load_time_ms,
    ttfb: metric.ttfb_ms,
    lcp: metric.lcp_ms,
    fid: metric.fid_ms,
    cls: metric.cls_score ? Math.round(metric.cls_score * 1000) / 1000 : undefined,
  }));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'cls') return [value, 'CLS Score'];
                return [`${value} ms`, name === 'loadTime' ? 'Load Time' : 
                                      name === 'ttfb' ? 'TTFB' : 
                                      name === 'lcp' ? 'LCP' : 
                                      name === 'fid' ? 'FID' : name];
              }}
              labelFormatter={(label) => `Time: ${label}`}
            />
            <Legend />
            <Line type="monotone" dataKey="loadTime" stroke="#8884d8" activeDot={{ r: 8 }} name="Load Time" />
            <Line type="monotone" dataKey="ttfb" stroke="#82ca9d" name="TTFB" />
            <Line type="monotone" dataKey="lcp" stroke="#ffc658" name="LCP" />
            <Line type="monotone" dataKey="fid" stroke="#ff8042" name="FID" />
            <Line type="monotone" dataKey="cls" stroke="#ff0000" name="CLS" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default PerformanceMetricsChart;
