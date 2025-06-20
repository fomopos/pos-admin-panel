// Test script to verify country code functionality
import { 
  detectUserCountryCode, 
  getCountryNameFromCode, 
  getCountryCodeFromName 
} from './src/utils/locationUtils.js';

console.log('=== Testing Country Code Functions ===');

// Test country code detection
const detectedCode = detectUserCountryCode();
console.log('Detected country code:', detectedCode);

// Test converting code to name
const countryName = getCountryNameFromCode('US');
console.log('US -> Country name:', countryName);

// Test converting name to code
const countryCode = getCountryCodeFromName('United States');
console.log('United States -> Country code:', countryCode);

// Test round-trip conversion
const testCodes = ['US', 'IN', 'GB', 'CA', 'AU'];
console.log('\n=== Testing Round-trip Conversions ===');
testCodes.forEach(code => {
  const name = getCountryNameFromCode(code);
  const backToCode = getCountryCodeFromName(name);
  console.log(`${code} -> ${name} -> ${backToCode}`);
});

console.log('\n=== Testing Invalid Values ===');
console.log('Empty string -> Code:', getCountryCodeFromName(''));
console.log('Invalid name -> Code:', getCountryCodeFromName('NotACountry'));
console.log('Empty code -> Name:', getCountryNameFromCode(''));
console.log('Invalid code -> Name:', getCountryNameFromCode('XX'));
