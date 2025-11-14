import { NextResponse } from 'next/server'
import { resolveChapter, slugToChapter, quranData } from '../utils/quran-utils'
import { trackUmamiEvent } from '../utils/plausible-tracker'

// Calculate Levenshtein distance for fuzzy matching
function levenshteinDistance(str1, str2) {
  const matrix = []
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  
  return matrix[str2.length][str1.length]
}

// Normalize chapter input by removing al- or al prefix
function normalizeChapterInput(input) {
  const normalized = input.toLowerCase().trim()
  
  // Remove "al-" or "al " prefix
  if (normalized.startsWith('al-')) {
    return normalized.substring(3)
  }
  if (normalized.startsWith('al ')) {
    return normalized.substring(3)
  }
  // Also handle cases where user types "al" without separator
  if (normalized.startsWith('al') && normalized.length > 2) {
    // Check if removing 'al' makes it a valid slug
    const withoutAl = normalized.substring(2)
    if (slugToChapter[withoutAl]) {
      return withoutAl
    }
  }
  
  return normalized
}

// Find similar slugs using fuzzy matching
function findSimilarSlugs(input, maxResults = 5) {
  const normalized = normalizeChapterInput(input)
  const allSlugs = Object.keys(slugToChapter)
  
  // Calculate distances for all slugs
  const distances = allSlugs.map(slug => ({
    slug,
    distance: levenshteinDistance(normalized, slug),
    chapterNumber: slugToChapter[slug]
  }))
  
  // Sort by distance and filter reasonable matches
  const maxDistance = Math.max(3, Math.floor(normalized.length * 0.4))
  const suggestions = distances
    .filter(item => item.distance <= maxDistance && item.distance > 0)
    .sort((a, b) => {
      // Prioritize shorter distance
      if (a.distance !== b.distance) {
        return a.distance - b.distance
      }
      // Then by chapter number
      return a.chapterNumber - b.chapterNumber
    })
    .slice(0, maxResults)
    .map(item => {
      const chapterData = quranData[item.chapterNumber]
      return {
        slug: item.slug,
        chapterNumber: item.chapterNumber,
        name: chapterData.transliteratedName,
        translatedName: chapterData.translatedName
      }
    })
  
  return suggestions
}

export async function GET(request, { params }) {
  try {
    const { chapter } = await params
    const normalizedChapter = normalizeChapterInput(chapter)
    
    // Try to resolve with normalized input
    let chapterNumber = resolveChapter(normalizedChapter)
    
    // If not found, try original input
    if (!chapterNumber) {
      chapterNumber = resolveChapter(chapter)
    }
    
    if (!chapterNumber) {
      // Find similar suggestions
      const suggestions = findSimilarSlugs(chapter)
      
      // Track chapter not found event
      await trackUmamiEvent(request, 'Chapter Not Found', {
        chapter: String(chapter),
        normalized: normalizedChapter,
        suggestionsCount: String(suggestions.length)
      })

      const response = {
        error: 'Chapter not found',
        provided: chapter,
        message: 'Use a valid chapter number (1-114) or slug like: baqarah, fatihah, yasin, etc.'
      }

      // Add suggestions if found
      if (suggestions.length > 0) {
        response.didYouMean = suggestions
        response.tip = 'Try using one of the suggested slugs above'
      } else {
        response.suggestion = 'Check your spelling or try a chapter number instead'
        response.examples = ['fatihah', 'baqarah', 'yasin', 'mulk', 'ikhlas']
      }

      return NextResponse.json(response, { status: 404 })
    }

    // Get chapter data for tracking
    const chapterData = quranData[chapterNumber]

    // Track successful redirect
    await trackUmamiEvent(request, 'Chapter Redirect Success', {
      chapter: String(chapter),
      normalized: normalizedChapter,
      chapterNumber: String(chapterNumber),
      chapterName: chapterData?.transliteratedName || '',
      hadPrefix: chapter.toLowerCase().startsWith('al') ? 'true' : 'false'
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