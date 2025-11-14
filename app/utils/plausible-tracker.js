// Helper function to send events to Umami Analytics
// Configure via environment variables:
// - UMAMI_URL: Your Umami server URL (e.g., https://umami.example.com)
// - UMAMI_WEBSITE_ID: Your website ID from Umami dashboard
// - UMAMI_API_KEY: (Optional) API key for authentication
export async function trackUmamiEvent(request, eventName, eventData = {}) {
  try {
    const umamiUrl = process.env.UMAMI_URL
    const websiteId = process.env.UMAMI_WEBSITE_ID
    const apiKey = process.env.UMAMI_API_KEY

    // Skip tracking if Umami is not configured
    if (!umamiUrl || !websiteId) {
      return
    }

    const userAgent = request.headers.get('user-agent') || ''
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     request.ip || '127.0.0.1'

    // Extract the first IP if there are multiple
    const ip = clientIP.split(',')[0].trim()

    // Get the full URL path
    const url = new URL(request.url)
    const pathname = url.pathname

    // Umami event payload format
    // Reference: https://docs.umami.is/docs/api/events
    const umamiPayload = {
      website: websiteId,
      url: pathname,
      event_name: eventName,
      event_data: eventData,
      hostname: url.hostname,
      referrer: request.headers.get('referer') || '',
    }

    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': userAgent,
      'X-Forwarded-For': ip,
    }

    // Add API key if provided
    if (apiKey) {
      headers['x-umami-api-key'] = apiKey
    }

    // Send event to Umami's collect endpoint
    await fetch(`${umamiUrl}/api/collect`, {
      method: 'POST',
      headers,
      body: JSON.stringify(umamiPayload),
    })
  } catch (error) {
    console.error('Failed to track Umami event:', error)
    // Don't throw - analytics failure shouldn't break the API
  }
}

// Keep the old function name for backward compatibility (deprecated)
export const trackPlausibleEvent = trackUmamiEvent

