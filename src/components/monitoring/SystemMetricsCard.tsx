
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface SystemMetric {
  name: string;
  value: number;
  max: number;
  unit: string;
  color?: string;
}

interface SystemMetricsCardProps {
  metrics: SystemMetric[];
  title: string;
  description?: string;
}

const SystemMetricsCard: React.FC<SystemMetricsCardProps> = ({ 
  metrics, 
  title, 
  description 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="w-24 h-24">
                <CircularProgressbar
                  value={metric.value}
                  maxValue={metric.max}
                  text={`${metric.value}${metric.unit}`}
                  styles={buildStyles({
                    textSize: '16px',
                    pathColor: metric.color || (metric.value / metric.max > 0.8 ? '#ef4444' : 
                                              metric.value / metric.max > 0.6 ? '#f97316' : 
                                              '#22c55e'),
                    textColor: '#374151',
                    trailColor: '#e5e7eb',
                  })}
                />
              </div>
              <p className="mt-2 text-sm font-medium text-center">{metric.name}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemMetricsCard;
