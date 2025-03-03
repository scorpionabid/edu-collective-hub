
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { detectBrowser } from '@/lib/browser/detection';
import { ExternalLink } from 'lucide-react';

export const BrowserWarning: React.FC = () => {
  const browserInfo = detectBrowser();
  
  if (browserInfo.isSupported) {
    return null;
  }
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTitle className="flex items-center gap-2">
        Browser Compatibility Warning
      </AlertTitle>
      <AlertDescription>
        <p className="mb-2">
          Your browser ({browserInfo.name} {browserInfo.version}) may not be fully supported by InfoLine.
          Some features may not work correctly.
        </p>
        <p className="text-sm">
          For the best experience, please use the latest version of 
          Chrome, Firefox, Safari, or Edge.
        </p>
        <div className="flex mt-3 gap-4 text-xs">
          <a 
            href="https://www.google.com/chrome/" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-1 text-blue-600 hover:underline"
          >
            <ExternalLink size={12} /> Chrome
          </a>
          <a 
            href="https://www.mozilla.org/firefox/" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-1 text-blue-600 hover:underline"
          >
            <ExternalLink size={12} /> Firefox
          </a>
          <a 
            href="https://www.apple.com/safari/" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-1 text-blue-600 hover:underline"
          >
            <ExternalLink size={12} /> Safari
          </a>
          <a 
            href="https://www.microsoft.com/edge/" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-1 text-blue-600 hover:underline"
          >
            <ExternalLink size={12} /> Edge
          </a>
        </div>
      </AlertDescription>
    </Alert>
  );
};
