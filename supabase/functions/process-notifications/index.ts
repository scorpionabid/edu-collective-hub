
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

// AWS SES or SendGrid could be used here for email delivery
// For demonstration, we'll just log the emails that would be sent

// Define our types
interface EmailQueueItem {
  id: string
  user_id: string
  recipient_email: string
  subject: string
  body: string
  html_body?: string
  status: 'pending' | 'sent' | 'failed' | 'bounced'
  attempts: number
  notification_id?: string
}

interface PushQueueItem {
  id: string
  user_id: string
  device_id: string
  title: string
  body: string
  data?: any
  status: 'pending' | 'sent' | 'failed'
  attempts: number
  notification_id?: string
}

interface UserDevice {
  id: string
  user_id: string
  device_token: string
  device_type: 'web' | 'android' | 'ios'
}

// Cors headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create Supabase client using service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Determine which queue to process based on the request
    const url = new URL(req.url)
    const queue = url.searchParams.get('queue') || 'all'
    
    const result: Record<string, any> = {
      processed: 0,
      success: 0,
      failed: 0,
    }

    // Process email queue
    if (queue === 'email' || queue === 'all') {
      // Get pending emails with <= 3 attempts
      const { data: emails, error: emailError } = await supabase
        .from('email_queue')
        .select('*')
        .eq('status', 'pending')
        .lte('attempts', 3)
        .limit(50)
      
      if (emailError) {
        console.error('Error fetching email queue:', emailError)
      } else if (emails && emails.length > 0) {
        result.emails = {
          processed: emails.length,
          success: 0,
          failed: 0,
        }
        
        // Process each email
        for (const email of emails as EmailQueueItem[]) {
          try {
            // Here you would integrate with an email service like SendGrid or AWS SES
            console.log(`Sending email to ${email.recipient_email}: ${email.subject}`)
            
            // For demo, we'll just simulate successful email sending 90% of the time
            const isSuccess = Math.random() > 0.1
            
            if (isSuccess) {
              await supabase
                .from('email_queue')
                .update({
                  status: 'sent',
                  sent_at: new Date().toISOString(),
                  attempts: email.attempts + 1
                })
                .eq('id', email.id)
              
              result.emails.success++
            } else {
              await supabase
                .from('email_queue')
                .update({
                  status: email.attempts >= 3 ? 'failed' : 'pending',
                  attempts: email.attempts + 1,
                  last_attempt_at: new Date().toISOString(),
                  error_message: 'Simulated failure'
                })
                .eq('id', email.id)
              
              result.emails.failed++
            }
          } catch (err) {
            console.error(`Error processing email ${email.id}:`, err)
            result.emails.failed++
            
            await supabase
              .from('email_queue')
              .update({
                attempts: email.attempts + 1,
                last_attempt_at: new Date().toISOString(),
                error_message: err.message || 'Unknown error'
              })
              .eq('id', email.id)
          }
        }
      }
    }
    
    // Process push notification queue
    if (queue === 'push' || queue === 'all') {
      // Get pending push notifications with <= 3 attempts
      const { data: pushNotifications, error: pushError } = await supabase
        .from('push_notification_queue')
        .select('*, user_devices!inner(device_token, device_type)')
        .eq('status', 'pending')
        .lte('attempts', 3)
        .limit(50)
      
      if (pushError) {
        console.error('Error fetching push queue:', pushError)
      } else if (pushNotifications && pushNotifications.length > 0) {
        result.push = {
          processed: pushNotifications.length,
          success: 0,
          failed: 0,
        }
        
        // Process each push notification
        for (const notification of pushNotifications) {
          try {
            // Get the device info
            const device = notification.user_devices
            
            // Here you would integrate with FCM or other push service
            console.log(`Sending push to device ${device.device_token}: ${notification.title}`)
            
            // For demo, we'll just simulate successful push delivery 85% of the time
            const isSuccess = Math.random() > 0.15
            
            if (isSuccess) {
              await supabase
                .from('push_notification_queue')
                .update({
                  status: 'sent',
                  sent_at: new Date().toISOString(),
                  attempts: notification.attempts + 1
                })
                .eq('id', notification.id)
              
              result.push.success++
            } else {
              await supabase
                .from('push_notification_queue')
                .update({
                  status: notification.attempts >= 3 ? 'failed' : 'pending',
                  attempts: notification.attempts + 1,
                  last_attempt_at: new Date().toISOString(),
                  error_message: 'Simulated failure'
                })
                .eq('id', notification.id)
              
              result.push.failed++
            }
          } catch (err) {
            console.error(`Error processing push notification ${notification.id}:`, err)
            result.push.failed++
            
            await supabase
              .from('push_notification_queue')
              .update({
                attempts: notification.attempts + 1,
                last_attempt_at: new Date().toISOString(),
                error_message: err.message || 'Unknown error'
              })
              .eq('id', notification.id)
          }
        }
      }
    }

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    )
  } catch (err) {
    console.error('Error processing notifications:', err)
    
    return new Response(
      JSON.stringify({ error: err.message }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        }
      }
    )
  }
})
