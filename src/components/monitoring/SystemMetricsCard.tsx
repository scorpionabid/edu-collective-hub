
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { 
  Cpu, 
  HardDrive, 
  Database, 
  Users, 
  Activity, 
  Server, 
  Ram, 
  Network 
} from 'lucide-react';

interface SystemMetricsCardProps {
  title: string;
  value: number;
  unit: string;
  description: string;
  icon: string;
}

export function SystemMetricsCard({ 
  title, 
  value, 
  unit, 
  description, 
  icon 
}: SystemMetricsCardProps) {
  // Helper function to render the appropriate icon
  const renderIcon = () => {
    switch(icon) {
      case 'Cpu':
        return <Cpu size={24} />;
      case 'HardDrive':
        return <HardDrive size={24} />;
      case 'Memory':
      case 'Ram':
        return <Ram size={24} />;
      case 'Users':
        return <Users size={24} />;
      case 'Activity':
        return <Activity size={24} />;
      case 'Server':
        return <Server size={24} />;
      case 'Database':
        return <Database size={24} />;
      case 'Network':
        return <Network size={24} />;
      default:
        return <Activity size={24} />;
    }
  };
  
  // Calculate the color based on the value
  // High values for CPU, Memory, Disk are bad (red)
  // High values for Users, etc. are good (green)
  const getColor = () => {
    if (['Cpu', 'Memory', 'Ram', 'HardDrive', 'Database'].includes(icon)) {
      if (value > 80) return '#ef4444'; // red
      if (value > 60) return '#f59e0b'; // amber
      return '#10b981'; // green
    } else {
      // For metrics where higher is better
      if (value > 80) return '#10b981'; // green
      if (value > 40) return '#f59e0b'; // amber
      return '#ef4444'; // red
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16">
            <CircularProgressbar
              value={value}
              maxValue={100}
              text={`${Math.round(value)}${unit}`}
              styles={buildStyles({
                rotation: 0,
                strokeLinecap: 'round',
                textSize: '24px',
                pathTransitionDuration: 0.5,
                pathColor: getColor(),
                textColor: getColor(),
                trailColor: '#e6e6e6',
              })}
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {renderIcon()}
              <h3 className="text-lg font-semibold">{title}</h3>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
