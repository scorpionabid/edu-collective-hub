
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PerformanceMetricsChart } from './PerformanceMetricsChart';
import { PerformanceMetric } from '@/lib/monitoring/types';

interface PerformanceTrendsCardProps {
  data: PerformanceMetric[];
}

export function PerformanceTrendsCard({ data }: PerformanceTrendsCardProps) {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Performance Trends</CardTitle>
        <CardDescription>Page load times over time</CardDescription>
      </CardHeader>
      <CardContent>
        <PerformanceMetricsChart data={data} />
      </CardContent>
    </Card>
  );
}
