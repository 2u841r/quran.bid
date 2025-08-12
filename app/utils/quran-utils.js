// Import Quran data from existing file
import { quranData } from '../quran.js'

// Create a reverse lookup map for efficient slug-to-chapter mapping
export const slugToChapter = {}
Object.keys(quranData).forEach(chapterNumber => {
  const chapter = quranData[chapterNumber]
  chapter.slug.forEach(slug => {
    slugToChapter[slug.toLowerCase()] = chapterNumber
  })
})

// Helper function to resolve chapter
export const resolveChapter = (chapter) => {
  if (typeof chapter !== 'string') {
    return null
  }
  const input = chapter.trim()
  // If it's a number, normalize (remove leading zeros) and return as string
  if (/^\d+$/.test(input)) {
    const chapterNum = parseInt(input, 10)
    if (chapterNum >= 1 && chapterNum <= 114) {
      return String(chapterNum)
    }
  } else {
    // Otherwise, look up the slug
    const resolved = slugToChapter[input.toLowerCase()]
    if (resolved) return resolved
  }
  return null
}

// Re-export quranData for use in other files
export { quranData }
