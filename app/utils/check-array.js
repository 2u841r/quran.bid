const {quranData} = require('../quran.js');

/**
 * Validates all Quran slug arrays for:
 * 1. Each slug array is a valid array
 * 2. No duplicate slugs within the same surah
 * 3. No conflicts (duplicate slugs) across different surahs
 * 
 * @returns {Object} Validation result with status and details
 */
function checkQuranSlugs() {
  const results = {
    isValid: true,
    errors: [],
    warnings: [],
    duplicates: [],
    invalidArrays: [],
    stats: {
      totalSurahs: 0,
      totalSlugs: 0,
      uniqueSlugs: 0
    }
  };

  const allSlugs = new Map(); // slug -> [surah numbers that have this slug]
  const surahNumbers = Object.keys(quranData);
  
  results.stats.totalSurahs = surahNumbers.length;

  // Check each surah's slug array
  for (const surahNumber of surahNumbers) {
    const surah = quranData[surahNumber];
    const slugArray = surah.slug;

    // Check if slug property exists and is an array
    if (!slugArray) {
      results.errors.push(`Surah ${surahNumber} (${surah.transliteratedName}) is missing slug property`);
      results.invalidArrays.push(surahNumber);
      results.isValid = false;
      continue;
    }

    if (!Array.isArray(slugArray)) {
      results.errors.push(`Surah ${surahNumber} (${surah.transliteratedName}) slug is not an array`);
      results.invalidArrays.push(surahNumber);
      results.isValid = false;
      continue;
    }

    // Check for empty array
    if (slugArray.length === 0) {
      results.warnings.push(`Surah ${surahNumber} (${surah.transliteratedName}) has empty slug array`);
    }

    // Check for duplicates within the same surah
    const surahSlugs = new Set();
    const surahDuplicates = [];

    for (const slug of slugArray) {
      // Check if slug is a string
      if (typeof slug !== 'string') {
        results.errors.push(`Surah ${surahNumber} (${surah.transliteratedName}) contains non-string slug: ${JSON.stringify(slug)}`);
        results.isValid = false;
        continue;
      }

      // Check if slug is empty or just whitespace
      if (!slug.trim()) {
        results.errors.push(`Surah ${surahNumber} (${surah.transliteratedName}) contains empty or whitespace-only slug`);
        results.isValid = false;
        continue;
      }

      const normalizedSlug = slug.toLowerCase().trim();
      
      // Check for duplicates within same surah
      if (surahSlugs.has(normalizedSlug)) {
        surahDuplicates.push(slug);
        results.isValid = false;
      } else {
        surahSlugs.add(normalizedSlug);
      }

      // Track global slug usage
      if (!allSlugs.has(normalizedSlug)) {
        allSlugs.set(normalizedSlug, []);
      }
      allSlugs.get(normalizedSlug).push(surahNumber);
      
      results.stats.totalSlugs++;
    }

    // Report duplicates within this surah
    if (surahDuplicates.length > 0) {
      results.errors.push(`Surah ${surahNumber} (${surah.transliteratedName}) has duplicate slugs: ${surahDuplicates.join(', ')}`);
    }
  }

  // Check for conflicts across different surahs
  for (const [slug, surahNumbers] of allSlugs.entries()) {
    if (surahNumbers.length > 1) {
      const surahNames = surahNumbers.map(num => `${num} (${quranData[num].transliteratedName})`);
      results.duplicates.push({
        slug,
        surahs: surahNumbers,
        surahNames
      });
      results.errors.push(`Slug "${slug}" is used in multiple surahs: ${surahNames.join(', ')}`);
      results.isValid = false;
    }
  }

  results.stats.uniqueSlugs = allSlugs.size;

  return results;
}

/**
 * Prints a formatted report of the validation results
 * @param {Object} results - Results from checkQuranSlugs()
 */
function printValidationReport(results) {
  console.log('\n=== Quran Slug Validation Report ===');
  console.log(`Total Surahs: ${results.stats.totalSurahs}`);
  console.log(`Total Slugs: ${results.stats.totalSlugs}`);
  console.log(`Unique Slugs: ${results.stats.uniqueSlugs}`);
  console.log(`Status: ${results.isValid ? '✅ VALID' : '❌ INVALID'}`);
  
  if (results.errors.length > 0) {
    console.log('\n🚨 ERRORS:');
    results.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
  }
  
  if (results.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    results.warnings.forEach((warning, index) => {
      console.log(`  ${index + 1}. ${warning}`);
    });
  }
  
  if (results.duplicates.length > 0) {
    console.log('\n🔄 DUPLICATE SLUGS ACROSS SURAHS:');
    results.duplicates.forEach((dup, index) => {
      console.log(`  ${index + 1}. "${dup.slug}" appears in: ${dup.surahNames.join(', ')}`);
    });
  }
  
  if (results.invalidArrays.length > 0) {
    console.log('\n📋 SURAHS WITH INVALID SLUG ARRAYS:');
    results.invalidArrays.forEach((surahNum, index) => {
      const surah = quranData[surahNum];
      console.log(`  ${index + 1}. Surah ${surahNum} (${surah?.transliteratedName || 'Unknown'})`);
    });
  }
  
  console.log('\n=== End Report ===\n');
}

/**
 * Quick validation function that runs the check and prints the report
 * @returns {Object} Validation results object
 */
function validateQuranSlugs() {
  const results = checkQuranSlugs();
  printValidationReport(results);
  return results;
}

// Run validation when file is executed directly
if (require.main === module) {
  validateQuranSlugs();
}

module.exports = {
  checkQuranSlugs,
  printValidationReport,
  validateQuranSlugs
};