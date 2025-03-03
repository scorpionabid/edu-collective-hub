
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AccessDeniedProps {
  message?: string;
}

export function AccessDenied({ message = "İstifadəçinin bu əməliyyata icazəsi yoxdur" }: AccessDeniedProps) {
  return (
    <Card className="mx-auto max-w-md shadow-md">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <AlertCircle className="h-12 w-12 text-red-500" />
        </div>
        <CardTitle>İcazə yoxdur</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground text-center">
          Bu əməliyyata çıxış əldə etmək üçün, zəhmət olmasa sistem administratoru ilə əlaqə saxlayın.
        </p>
      </CardContent>
    </Card>
  );
}
