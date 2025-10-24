const { quranData } = require('../quran.js');

/**
 * Remove duplicates from an array while preserving order
 * @param {Array} array - The array to remove duplicates from
 * @returns {Array} - Array with duplicates removed
 */
function removeDuplicates(array) {
  if (!Array.isArray(array)) {
    return array;
  }
  return [...new Set(array)];
}

/**
 * Remove duplicates from all slug arrays in quranData
 * @returns {Object} - Updated quranData with duplicates removed
 */
function removeQuranDuplicates() {
  const cleanedData = { ...quranData };
  
  Object.keys(cleanedData).forEach(surahNumber => {
    const surah = cleanedData[surahNumber];
    if (surah && Array.isArray(surah.slug)) {
      const originalLength = surah.slug.length;
      surah.slug = removeDuplicates(surah.slug);
      const newLength = surah.slug.length;
      
      if (originalLength !== newLength) {
        console.log(`Surah ${surahNumber} (${surah.transliteratedName}): Removed ${originalLength - newLength} duplicates`);
      }
    }
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
  
  const filePath = path.resolve('./app/quran.js');
  
  try {
    fs.writeFileSync(filePath, cleanedFileContent, 'utf8');
    console.log('\n✅ Successfully updated quran.js file!');
    console.log('Duplicates have been permanently removed.');
  } catch (error) {
    console.error('❌ Error writing to file:', error.message);
  }
  
  return cleanedData;
}

module.exports = {
  removeDuplicates,
  removeQuranDuplicates,
  generateCleanedQuranFile,
  cleanQuranSlugs,
  applyCleanupToFile
};