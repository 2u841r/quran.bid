import { NextResponse } from 'next/server'
import { resolveChapter, slugToChapter, quranData } from '../../utils/quran-utils'
import { trackUmamiEvent } from '../../utils/plausible-tracker'
import { Logger } from 'next-axiom'

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
  // Handle cases where user types "al" without separator
  if (normalized.startsWith('al') && normalized.length > 2) {
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
      if (a.distance !== b.distance) {
        return a.distance - b.distance
      }
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
  const logger = new Logger({ source: 'middleware' })
  logger.middleware(request)

  try {
    const { chapter, verse } = await params
    const normalizedChapter = normalizeChapterInput(chapter)
    
    // Try to resolve with normalized input
    let chapterNumber = resolveChapter(normalizedChapter)
    
    // If not found, try original input
    if (!chapterNumber) {
      chapterNumber = resolveChapter(chapter)
    }

    // Debug: Log the raw params
    console.log('Raw params:', { chapter, verse, chapterNumber, normalized: normalizedChapter })

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
        await trackUmamiEvent(request, 'Chapter Data Missing', {
          chapter: String(chapter),
          chapterNumber: String(chapterNumber),
          verse: String(verse),
        })

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
        await trackUmamiEvent(request, 'Invalid Verse Number', {
          chapter: String(chapter),
          verse: String(verse),
          chapterNumber: String(chapterNumber),
          maxVerses: chapterData.versesCount,
        })

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
      await trackUmamiEvent(request, 'Chapter Redirect Success', {
        chapter: String(chapter),
        verse: String(verse),
        chapterNumber: String(chapterNumber),
        chapterName: chapterData.transliteratedName,
        hadPrefix: chapter.toLowerCase().startsWith('al') ? 'true' : 'false'
      })

      const redirectUrl = `https://quran.com/${chapterNumber}/${verse}`
      // Flush logs before redirect
      await logger.flush()
      return NextResponse.redirect(redirectUrl, 301)
    }

    // No chapterNumber could be resolved from input
    // Find similar suggestions
    const suggestions = findSimilarSlugs(chapter)
    
    console.log(`❌ failed: ${chapter} - ${verse}`)
    logger.error(`❌ ${chapter} - ${verse} Chapter redirect failed`, {
      chapter: String(chapter),
      verse: String(verse),
      normalized: normalizedChapter,
      suggestionsCount: String(suggestions.length),
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer'),
    })

    // Track chapter not found event
    await trackUmamiEvent(request, 'Chapter Not Found', {
      chapter: String(chapter),
      verse: String(verse),
      normalized: normalizedChapter,
      suggestionsCount: String(suggestions.length)
    })

    // Build response with suggestions
    const response = {
      error: 'Chapter not found',
      provided: { chapter, verse },
      message: 'Use a valid chapter number (1-114) or slug like: baqarah, fatihah, yasin, etc.'
    }

    // Add suggestions if found
    if (suggestions.length > 0) {
      response.didYouMean = suggestions
      response.tip = 'Try using one of the suggested chapter slugs above'
    } else {
      response.suggestion = 'Check your spelling or try a chapter number instead'
      response.examples = ['fatihah/1', 'baqarah/255', 'yasin/1', 'mulk/1', 'ikhlas/1']
    }

    // Flush logs before returning JSON response
    await logger.flush()
    return NextResponse.json(response, { status: 404 })
  } catch (error) {
    // Catch-all to avoid unlogged 500s
    const message = error instanceof Error ? error.message : String(error)
    const stack = error instanceof Error ? error.stack : undefined
    console.error('❌ Unhandled error in [chapter]/[verse] route:', message)
    logger.error('❌ Unhandled error in [chapter]/[verse] route', { message, stack })

    // Track server error event
    await trackUmamiEvent(request, 'Server Error', {
      error: message,
    })

    await logger.flush()
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}