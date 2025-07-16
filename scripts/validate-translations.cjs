#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load all translation files
const localesDir = path.join(__dirname, '../src/locales');
const languages = ['en', 'es', 'hi', 'ar', 'de', 'sk'];

function loadTranslation(lang) {
  try {
    const filePath = path.join(localesDir, lang, 'translation.json');
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.error(`Error loading ${lang}:`, error.message);
    return null;
  }
}

function getKeys(obj, prefix = '') {
  const keys = [];
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys.push(...getKeys(obj[key], prefix ? `${prefix}.${key}` : key));
    } else {
      keys.push(prefix ? `${prefix}.${key}` : key);
    }
  }
  return keys;
}

function validateTranslations() {
  console.log('🔍 Validating translation key coverage...\n');
  
  const translations = {};
  const allKeys = new Set();
  
  // Load all translations
  for (const lang of languages) {
    const translation = loadTranslation(lang);
    if (translation) {
      translations[lang] = translation;
      const keys = getKeys(translation);
      keys.forEach(key => allKeys.add(key));
      console.log(`✅ Loaded ${lang}: ${keys.length} keys`);
    } else {
      console.log(`❌ Failed to load ${lang}`);
    }
  }
  
  console.log(`\n📊 Total unique keys: ${allKeys.size}\n`);
  
  // Check coverage for each language
  const coverage = {};
  for (const lang of languages) {
    if (translations[lang]) {
      const langKeys = new Set(getKeys(translations[lang]));
      const missingKeys = [...allKeys].filter(key => !langKeys.has(key));
      const completeness = ((langKeys.size / allKeys.size) * 100).toFixed(1);
      
      coverage[lang] = {
        total: langKeys.size,
        missing: missingKeys.length,
        completeness: parseFloat(completeness)
      };
      
      console.log(`${lang.toUpperCase()}: ${completeness}% complete (${langKeys.size}/${allKeys.size} keys)`);
      if (missingKeys.length > 0) {
        console.log(`  Missing keys: ${missingKeys.slice(0, 5).join(', ')}${missingKeys.length > 5 ? '...' : ''}`);
      }
    }
  }
  
  console.log('\n🎯 Summary:');
  console.log('Languages with 100% coverage:', languages.filter(lang => coverage[lang]?.completeness === 100).join(', ') || 'None');
  console.log('Languages needing attention:', languages.filter(lang => coverage[lang]?.completeness < 100).join(', ') || 'None');
  
  return coverage;
}

if (require.main === module) {
  validateTranslations();
}

module.exports = { validateTranslations, getKeys };