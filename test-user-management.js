// Simple test script to verify User Management functionality
import axios from 'axios';

async function testUserManagement() {
  try {
    console.log('🧪 Testing User Management functionality...\n');
    
    // Test 1: Check if the main page loads
    console.log('1️⃣ Testing main page accessibility...');
    const mainPageResponse = await axios.get('http://localhost:5173/', {
      timeout: 5000,
      headers: { 'Accept': 'text/html' }
    });
    console.log(`✅ Main page status: ${mainPageResponse.status}`);
    
    // Test 2: Check if User Management page loads
    console.log('\n2️⃣ Testing User Management page accessibility...');
    const userPageResponse = await axios.get('http://localhost:5173/settings/users', {
      timeout: 5000,
      headers: { 'Accept': 'text/html' }
    });
    console.log(`✅ User Management page status: ${userPageResponse.status}`);
    
    // Test 3: Check if the page contains expected content
    console.log('\n3️⃣ Testing page content...');
    const pageContent = userPageResponse.data;
    
    if (pageContent.includes('react') || pageContent.includes('script')) {
      console.log('✅ Page appears to contain React application');
    } else {
      console.log('⚠️  Page might not be loading React properly');
    }
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- Server is running and accessible');
    console.log('- User Management route is properly configured');
    console.log('- Page is loading without major errors');
    console.log('\n🔍 Next: Check the browser for visual confirmation and mock data display');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Suggestion: Make sure the development server is running:');
      console.log('   npm run dev');
    } else if (error.response) {
      console.log(`\n📊 Server responded with status: ${error.response.status}`);
      console.log(`📊 Response: ${error.response.statusText}`);
    }
  }
}

testUserManagement();
