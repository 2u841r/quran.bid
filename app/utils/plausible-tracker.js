// Helper function to send events to Umami Analytics
// Configure via environment variables:
// - UMAMI_URL: Your Umami server URL (e.g., https://cloud.umami.is)
// - UMAMI_WEBSITE_ID or NEXT_PUBLIC_UMAMI_WEBSITE_ID: Your website ID from Umami dashboard
// - UMAMI_API_KEY: (Optional) API key for authentication
export async function trackUmamiEvent(request, eventName, eventData = {}) {
  try {
    // Support both server-side and client-side env var names
    const umamiUrl = process.env.UMAMI_URL || 'https://cloud.umami.is'
    const websiteId = process.env.UMAMI_WEBSITE_ID || process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID
    const apiKey = process.env.UMAMI_API_KEY

    // Skip tracking if Umami is not configured
    if (!websiteId) {
      console.warn('Umami tracking skipped: UMAMI_WEBSITE_ID or NEXT_PUBLIC_UMAMI_WEBSITE_ID not set')
      return
    }

    const userAgent = request.headers.get('user-agent') || ''
    const referrer = request.headers.get('referer') || ''

    // Get the full URL path
    const url = new URL(request.url)
    const pathname = url.pathname
    const hostname = url.hostname

    // Get client IP
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     request.ip || '127.0.0.1'
    const ip = clientIP.split(',')[0].trim()

    // Normalize URL - ensure it has protocol and no trailing slash
    let normalizedUrl = umamiUrl.trim()
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = `https://${normalizedUrl}`
    }
    normalizedUrl = normalizedUrl.replace(/\/$/, '')

    // Use /api/send endpoint for Umami Cloud (supports server-side tracking)
    const sendUrl = `${normalizedUrl}/api/send`

    // Prepare payload according to Umami's API spec
    const payload = {
      type: 'event',
      payload: {
        website: websiteId,
        hostname: hostname,
        url: pathname,
        referrer: referrer || '',
        name: eventName,
        data: eventData,
      }
    }

    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': userAgent,
    }

    // Add API key if provided
    if (apiKey) {
      headers['x-umami-api-key'] = apiKey
    }

    console.log('📊 Sending to Umami:', { sendUrl, eventName, eventData })
    
    const response = await fetch(sendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })

    console.log('📊 Umami response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      eventName,
    })

    if (!response.ok) {
      const responseText = await response.text().catch(() => 'Unable to read response')
      console.error(`Umami tracking failed: ${response.status} ${response.statusText}`, {
        url: sendUrl,
        eventName,
        eventData,
        responseBody: responseText,
      })
    } else {
      console.log('✅ Umami tracking successful:', eventName)
    }
  } catch (error) {
    console.error('Failed to track Umami event:', error.message, {
      eventName,
      eventData,
      url: request.url,
    })
    // Don't throw - analytics failure shouldn't break the API
  }
}

// Keep the old function name for backward compatibility (deprecated)
export const trackPlausibleEvent = trackUmamiEvent