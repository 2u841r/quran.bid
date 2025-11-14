const { quranData } = require('../quran.js');

/**
 * Remove duplicates from an array while preserving order (case-insensitive)
 * @param {Array} array - The array to remove duplicates from
 * @returns {Array} - Array with duplicates removed
 */
function removeDuplicates(array) {
  if (!Array.isArray(array)) {
    return array;
  }
  
  // Use a Map to preserve order and track normalized values (case-insensitive)
  const seen = new Map();
  const result = [];
  
  for (const item of array) {
    if (typeof item === 'string') {
      const normalized = item.toLowerCase().trim();
      if (!seen.has(normalized)) {
        seen.set(normalized, true);
        result.push(item); // Keep original case of first occurrence
      }
    } else {
      // For non-string items, use regular Set logic
      if (!seen.has(item)) {
        seen.set(item, true);
        result.push(item);
      }
    }
  }
  
  return result;
}

/**
 * Remove duplicates from all slug arrays in quranData
 * @returns {Object} - Updated quranData with duplicates removed (deep copy)
 */
function removeQuranDuplicates() {
  // Create a deep copy to avoid mutating the original
  const cleanedData = {};
  
  Object.keys(quranData).forEach(surahNumber => {
    const surah = quranData[surahNumber];
    // Create a new object with a new slug array
    cleanedData[surahNumber] = {
      ...surah,
      slug: removeDuplicates(surah.slug) // This creates a new array
    };
  });
  
  return cleanedData;
}

/**
 * Generate cleaned quran.js file content with duplicates removed
 * @returns {string} - The cleaned file content
 */
function generateCleanedQuranFile() {
  const cleanedData = removeQuranDuplicates();
  
  let fileContent = 'export const quranData = {\n';
  
  Object.keys(cleanedData).forEach((surahNumber, index) => {
    const surah = cleanedData[surahNumber];
    const isLast = index === Object.keys(cleanedData).length - 1;
    
    fileContent += `  "${surahNumber}": {\n`;
    fileContent += `    "revelationPlace": ${JSON.stringify(surah.revelationPlace)},\n`;
    fileContent += `    "transliteratedName": ${JSON.stringify(surah.transliteratedName)},\n`;
    fileContent += `    "versesCount": ${surah.versesCount},\n`;
    fileContent += `    "translatedName": ${JSON.stringify(surah.translatedName)},\n`;
    fileContent += `    "slug": [\n`;
    
    surah.slug.forEach((slug, slugIndex) => {
      const isLastSlug = slugIndex === surah.slug.length - 1;
      fileContent += `      ${JSON.stringify(slug)}${isLastSlug ? '' : ','}`;
      fileContent += '\n';
    });
    
    fileContent += `    ]\n`;
    fileContent += `  }${isLast ? '' : ','}`;
    fileContent += '\n';
  });
  
  fileContent += '};\n';
  
  return fileContent;
}

/**
 * Remove duplicates and show report
 */
function cleanQuranSlugs() {
  console.log('=== Removing Duplicates from Quran Slugs ===');
  
  const cleanedData = removeQuranDuplicates();
  
  console.log('\n=== Cleanup Complete ===');
  console.log('Use generateCleanedQuranFile() to get the cleaned file content.');
  
  return cleanedData;
}

/**
 * Apply duplicate removal directly to the quran.js file
 */
async function applyCleanupToFile() {
  const fs = await import('fs');
  const path = await import('path');
  
  console.log('=== Applying Duplicate Removal to quran.js ===');
  
  const cleanedData = removeQuranDuplicates();
  const cleanedFileContent = generateCleanedQuranFile();
  
  // Resolve path relative to the script location, then go up one level to app/
  const scriptDir = path.dirname(__filename);
  const projectRoot = path.resolve(scriptDir, '..');
  const filePath = path.join(projectRoot, 'quran.js');
  
  try {
    fs.writeFileSync(filePath, cleanedFileContent, 'utf8');
    console.log(`\n✅ Successfully updated ${filePath}!`);
    console.log('Duplicates have been permanently removed.');
  } catch (error) {
    console.error('❌ Error writing to file:', error.message);
    console.error('Attempted path:', filePath);
    throw error;
  }
  
  return cleanedData;
}

// Run cleanup when file is executed directly
if (require.main === module) {
  (async () => {
    console.log('=== Removing Duplicates from Quran Slugs ===\n');
    
    const cleanedData = removeQuranDuplicates();
    
    // Count total duplicates removed
    // We need to compare BEFORE cleaning, so let's count from original data
    let totalRemoved = 0;
    Object.keys(quranData).forEach(surahNumber => {
      const surah = quranData[surahNumber];
      const cleanedSurah = cleanedData[surahNumber];
      if (surah && cleanedSurah && Array.isArray(surah.slug) && Array.isArray(cleanedSurah.slug)) {
        const originalLength = surah.slug.length;
        const cleanedLength = cleanedSurah.slug.length;
        const removed = originalLength - cleanedLength;
        if (removed > 0) {
          totalRemoved += removed;
          console.log(`Surah ${surahNumber} (${surah.transliteratedName}): Removed ${removed} duplicate(s)`);
        }
      }
    });
    
    if (totalRemoved === 0) {
      console.log('\n✅ No duplicates found! All slugs are unique.');
      console.log('\n=== Cleanup Complete ===\n');
    } else {
      console.log(`\n=== Summary ===`);
      console.log(`Total duplicates removed: ${totalRemoved}`);
      console.log(`\nApplying changes to quran.js...`);
      
      // Automatically apply the cleanup to the file
      try {
        await applyCleanupToFile();
        console.log('\n✅ Successfully updated quran.js file!');
        console.log('Duplicates have been permanently removed.');
      } catch (error) {
        console.error('\n❌ Error applying cleanup:', error.message);
      }
    }
  })();
}

module.exports = {
  removeDuplicates,
  removeQuranDuplicates,
  generateCleanedQuranFile,
  cleanQuranSlugs,
  applyCleanupToFile
};