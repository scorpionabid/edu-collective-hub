
/**
 * Email template rendering utility
 * This is a simple template engine that replaces variables in templates with actual values
 */

export interface EmailTemplateOptions {
  template: string;
  variables?: Record<string, any>;
}

/**
 * Render an email template with variables
 * @param options Template options
 * @returns Rendered template
 */
export function renderEmailTemplate(options: EmailTemplateOptions): string {
  const { template, variables = {} } = options;
  
  // Replace variables in the template
  // Format: {{variableName}}
  let rendered = template;
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    rendered = rendered.replace(regex, String(value));
  });
  
  return rendered;
}

/**
 * Common email templates
 */
export const emailTemplates = {
  /**
   * Basic template with header, content, and footer
   */
  basic: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #f8f9fa;
      padding: 20px;
      text-align: center;
      border-bottom: 1px solid #e9ecef;
    }
    .content {
      padding: 20px;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #6c757d;
      border-top: 1px solid #e9ecef;
    }
    .button {
      display: inline-block;
      background-color: #007bff;
      color: white;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 4px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>{{title}}</h1>
    </div>
    <div class="content">
      {{content}}
      
      {{#if buttonUrl}}
      <div style="text-align: center;">
        <a href="{{buttonUrl}}" class="button">{{buttonText}}</a>
      </div>
      {{/if}}
    </div>
    <div class="footer">
      &copy; {{year}} InfoLine. All rights reserved.
      <br>
      <small>This is an automated message, please do not reply.</small>
    </div>
  </div>
</body>
</html>
  `,
  
  /**
   * Notification template
   */
  notification: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .notification {
      border: 1px solid #e9ecef;
      border-radius: 6px;
      overflow: hidden;
    }
    .notification-header {
      background-color: #f8f9fa;
      padding: 15px;
      border-bottom: 1px solid #e9ecef;
    }
    .notification-body {
      padding: 20px;
    }
    .notification-footer {
      background-color: #f8f9fa;
      padding: 15px;
      text-align: center;
      font-size: 12px;
      color: #6c757d;
      border-top: 1px solid #e9ecef;
    }
    .button {
      display: inline-block;
      background-color: #007bff;
      color: white;
      text-decoration: none;
      padding: 8px 16px;
      border-radius: 4px;
      margin: 10px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="notification">
      <div class="notification-header">
        <h2 style="margin: 0;">{{title}}</h2>
      </div>
      <div class="notification-body">
        <p>{{body}}</p>
        
        {{#if actionUrl}}
        <div style="text-align: center;">
          <a href="{{actionUrl}}" class="button">{{actionText}}</a>
        </div>
        {{/if}}
      </div>
      <div class="notification-footer">
        You received this notification because you're subscribed to {{notificationType}} notifications.
        <br>
        <a href="{{preferencesUrl}}">Manage your notification preferences</a>
      </div>
    </div>
  </div>
</body>
</html>
  `,
};
