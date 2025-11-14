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

    // Umami collect API payload format
    // For custom events, we send event_name and optionally event_data
    const umamiPayload = {
      website: websiteId,
      url: pathname,
      referrer: referrer,
      event_name: eventName,
    }

    // Add event_data if provided (as a JSON string in the payload)
    if (Object.keys(eventData).length > 0) {
      // Umami expects event_data as a stringified JSON object
      umamiPayload.event_data = JSON.stringify(eventData)
    }

    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': userAgent,
    }

    // Add API key if provided
    if (apiKey) {
      headers['x-umami-api-key'] = apiKey
    }

    // Normalize URL - ensure it has protocol and no trailing slash
    let normalizedUrl = umamiUrl.trim()
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = `https://${normalizedUrl}`
    }
    normalizedUrl = normalizedUrl.replace(/\/$/, '')

    const collectUrl = `${normalizedUrl}/api/collect`

    // Send event to Umami's collect endpoint
    const response = await fetch(collectUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(umamiPayload),
    })

    if (!response.ok) {
      console.error(`Umami tracking failed: ${response.status} ${response.statusText}`, {
        url: collectUrl,
        payload: umamiPayload,
      })
    }
  } catch (error) {
    console.error('Failed to track Umami event:', error.message, {
      eventName,
      url: request.url,
    })
    // Don't throw - analytics failure shouldn't break the API
  }
}

// Keep the old function name for backward compatibility (deprecated)
export const trackPlausibleEvent = trackUmamiEvent

