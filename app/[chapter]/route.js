import { NextResponse } from 'next/server'
import { resolveChapter, slugToChapter } from '../utils/quran-utils'

export async function GET(request, { params }) {
  const { chapter } = params
  
  const chapterNumber = resolveChapter(chapter)
  
  if (!chapterNumber) {
    return NextResponse.json({
      error: 'Chapter not found',
      provided: chapter,
      suggestion: 'Use a valid chapter number (1-114) or slug like: baqarah, fatihah, yasin, etc.',
      availableSlugs: Object.keys(slugToChapter).slice(0, 20).concat(['...'])
    }, { status: 404 })
  }

  const redirectUrl = `https://quran.com/${chapterNumber}`
  return NextResponse.redirect(redirectUrl, 301)
}
