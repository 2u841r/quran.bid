import { NextResponse } from 'next/server'
import { resolveChapter, slugToChapter, quranData } from '../../utils/quran-utils'

import { Logger } from 'next-axiom'

// Helper function to send events to Plausible
// async function trackPlausibleEvent(request, eventName, props = {}) {
//   try {
//     const userAgent = request.headers.get('user-agent') || ''
//     const clientIP = request.headers.get('x-forwarded-for') || 
//                      request.headers.get('x-real-ip') || 
//                      request.ip || '127.0.0.1'

//     // Extract the first IP if there are multiple
//     const ip = clientIP.split(',')[0].trim()

//     const plausiblePayload = {
//       domain: 'quran.bid',
//       name: eventName,
//       url: `https://quran.bid${new URL(request.url).pathname}`,
//       props: props,
//     }

//     await fetch('https://ppp.qawmputer.com/api/event', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'User-Agent': userAgent,
//         'X-Forwarded-For': ip,
//       },
//       body: JSON.stringify(plausiblePayload),
//     })
//   } catch (error) {
//     console.error('Failed to track Plausible event:', error)
//     // Don't throw - analytics failure shouldn't break the API
//   }
// }

export async function GET(request, { params }) {
  const logger = new Logger({ source: 'middleware' })
  logger.middleware(request)

  try {
    const { chapter, verse } = await params
    const chapterNumber = resolveChapter(chapter)

    // Debug: Log the raw params
    console.log('Raw params:', { chapter, verse, chapterNumber })

    if (chapterNumber) {
      // Pull chapter data and validate existence
      const chapterData = quranData[chapterNumber]
      if (!chapterData) {
        console.error(`❌ missing chapter data for: ${chapterNumber}`)
        logger.error(`❌ Missing chapter data`, {
          chapter: String(chapter),
          chapterNumber: String(chapterNumber),
          verse: String(verse),
        })

        // Track error event
        // await trackPlausibleEvent(request, 'Chapter Data Missing', {
        //   chapter: String(chapter),
        //   chapterNumber: String(chapterNumber),
        //   verse: String(verse),
        // })

        await logger.flush()
        return NextResponse.json({
          error: 'Chapter data missing',
          chapterNumber: String(chapterNumber),
        }, { status: 500 })
      }

      const verseNumber = parseInt(verse, 10)

      // Check if verse number is valid
      if (isNaN(verseNumber) || verseNumber < 1 || verseNumber > chapterData.versesCount) {
        console.log(`❌ failed: ${chapter} - ${verse} (invalid verse number)`)
        logger.error(`❌ ${chapter} - ${verse} Chapter redirect failed - invalid verse number`, {
          chapter: String(chapter),
          verse: String(verse),
          chapterNumber: String(chapterNumber),
          maxVerses: chapterData.versesCount,
          userAgent: request.headers.get('user-agent'),
          referer: request.headers.get('referer'),
        })

        // Track invalid verse event
        // await trackPlausibleEvent(request, 'Invalid Verse Number', {
        //   chapter: String(chapter),
        //   verse: String(verse),
        //   chapterNumber: String(chapterNumber),
        //   maxVerses: chapterData.versesCount,
        // })

        // Flush logs before returning JSON response
        await logger.flush()
        return NextResponse.json({
          error: 'Invalid verse number',
          provided: { chapter, verse },
          chapterInfo: {
            name: chapterData.transliteratedName,
            totalVerses: chapterData.versesCount,
          },
          suggestion: `Verse number must be between 1 and ${chapterData.versesCount} for this chapter.`,
        }, { status: 400 })
      }

      console.log(`✅ success: ${chapter} - ${verse}`)
      logger.info(`✅ ${chapter} - ${verse} Chapter redirect success`, {
        chapter: String(chapter),
        verse: String(verse),
        chapterNumber: String(chapterNumber),
        userAgent: request.headers.get('user-agent'),
        referer: request.headers.get('referer'),
      })

      // Track successful redirect
      // await trackPlausibleEvent(request, 'Chapter Redirect Success', {
      //   chapter: String(chapter),
      //   verse: String(verse),
      //   chapterNumber: String(chapterNumber),
      //   chapterName: chapterData.transliteratedName,
      // })

      const redirectUrl = `https://quran.com/${chapterNumber}/${verse}`
      // Flush logs before redirect
      await logger.flush()
      return NextResponse.redirect(redirectUrl, 301)
    }

    // No chapterNumber could be resolved from input
    console.log(`❌ failed: ${chapter} - ${verse}`)
    logger.error(`❌ ${chapter} - ${verse} Chapter redirect failed`, {
      chapter: String(chapter),
      verse: String(verse),
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer'),
    })

    // Track chapter not found event
    // await trackPlausibleEvent(request, 'Chapter Not Found', {
    //   chapter: String(chapter),
    //   verse: String(verse),
    // })

    // Flush logs before returning JSON response
    await logger.flush()
    return NextResponse.json({
      error: 'Chapter not found',
      provided: chapter,
      suggestion: 'Use a valid chapter number (1-114) or slug like: baqarah, fatihah, yasin, etc.',
    }, { status: 404 })
  } catch (error) {
    // Catch-all to avoid unlogged 500s
    const message = error instanceof Error ? error.message : String(error)
    const stack = error instanceof Error ? error.stack : undefined
    console.error('❌ Unhandled error in [chapter]/[verse] route:', message)
    logger.error('❌ Unhandled error in [chapter]/[verse] route', { message, stack })

    // Track server error event
    // await trackPlausibleEvent(request, 'Server Error', {
    //   error: message,
    // })

    await logger.flush()
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}