
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SystemAlertsCardProps {
  criticalErrors: number;
  slowRequests: number;
  performanceIssues: number;
}

export function SystemAlertsCard({ 
  criticalErrors, 
  slowRequests, 
  performanceIssues 
}: SystemAlertsCardProps) {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>System Alerts</CardTitle>
        <CardDescription>Current system health issues</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span>Critical Errors</span>
            <Badge variant={criticalErrors > 0 ? "destructive" : "outline"}>{criticalErrors}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span>Slow API Requests</span>
            <Badge variant={slowRequests > 10 ? "destructive" : slowRequests > 5 ? "default" : "outline"}>{slowRequests}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span>Performance Issues</span>
            <Badge variant={performanceIssues > 10 ? "destructive" : performanceIssues > 5 ? "default" : "outline"}>{performanceIssues}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
