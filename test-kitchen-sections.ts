// Test file to verify kitchen sections functionality
import { KITCHEN_SECTIONS } from './src/types/hardware-api';

console.log('Available Kitchen Sections:');
KITCHEN_SECTIONS.forEach((section, index) => {
  console.log(`${index + 1}. ${section.label} (ID: ${section.id})`);
});

// Example usage in kitchen printer configuration
const exampleKitchenConfig = {
  printer_model: 'star_tsp143',
  paper_size: 'thermal_80mm',
  kitchen_sections: ['hot_kitchen', 'grill'], // Multiple sections selected
  print_header: true,
  print_timestamp: true,
  character_encoding: 'utf8'
};

console.log('\nExample Kitchen Printer Config:');
console.log(JSON.stringify(exampleKitchenConfig, null, 2));
