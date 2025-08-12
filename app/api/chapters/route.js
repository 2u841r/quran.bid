import { NextResponse } from 'next/server'
import { quranData } from '../quran-utils'

export async function GET() {
  return NextResponse.json(quranData)
}
