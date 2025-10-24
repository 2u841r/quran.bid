import { NextResponse } from 'next/server'
import { quranData, slugToChapter } from '../../../utils/quran-utils'

export async function GET(request, { params }) {
  const { slug } = params
  const chapterNumber = slugToChapter[slug.toLowerCase()]

  if (!chapterNumber) {
    return NextResponse.json(
      { error: 'Chapter not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    chapterNumber,
    ...quranData[chapterNumber]
  })
}
