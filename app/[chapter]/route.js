import { NextResponse } from 'next/server'
import { resolveChapter, slugToChapter, quranData } from '../utils/quran-utils'
import { trackUmamiEvent } from '../utils/plausible-tracker'

export async function GET(request, { params }) {
  try {
    const { chapter } = await params
    const chapterNumber = resolveChapter(chapter)
    
    if (!chapterNumber) {
      // Track chapter not found event
      await trackUmamiEvent(request, 'Chapter Not Found', {
        chapter: String(chapter),
      })

      return NextResponse.json({
        error: 'Chapter not found',
        provided: chapter,
        suggestion: 'Use a valid chapter number (1-114) or slug like: baqarah, fatihah, yasin, etc.',
        availableSlugs: Object.keys(slugToChapter).slice(0, 20).concat(['...'])
      }, { status: 404 })
    }

    // Get chapter data for tracking
    const chapterData = quranData[chapterNumber]

    // Track successful redirect
    await trackUmamiEvent(request, 'Chapter Redirect Success', {
      chapter: String(chapter),
      chapterNumber: String(chapterNumber),
      chapterName: chapterData?.transliteratedName || '',
    })

    const redirectUrl = `https://quran.com/${chapterNumber}`
    return NextResponse.redirect(redirectUrl, 301)
  } catch (error) {
    // Track server error event
    const message = error instanceof Error ? error.message : String(error)
    await trackUmamiEvent(request, 'Server Error', {
      error: message,
    })

    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
