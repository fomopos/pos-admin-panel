// Debug script to test API response directly
// Run this in the browser console after logging in

async function testApiResponse() {
    console.log('🧪 Testing API Response Debug');
    
    try {
        // Test if we can access the auth service
        console.log('1. Testing auth service...');
        const authService = window.authService || (await import('./src/auth/authService.js')).authService;
        
        // Check if user is authenticated
        const user = await authService.getCurrentUser();
        console.log('👤 Current user:', user);
        
        // Get access token
        const token = await authService.getAccessToken();
        console.log('🔑 Access token:', token ? 'Present' : 'Not found');
        
        // Test direct API call
        console.log('2. Testing direct API call...');
        const apiUrl = 'https://hympc2acjf.execute-api.ap-south-1.amazonaws.com/prod/v0/tenant';
        
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            }
        });
        
        console.log('📡 Direct API Response Status:', response.status);
        console.log('📡 Direct API Response OK:', response.ok);
        console.log('📡 Direct API Response Headers:', Object.fromEntries(response.headers.entries()));
        
        const responseText = await response.text();
        console.log('📦 Raw Response Text:', responseText);
        
        let responseData;
        try {
            responseData = JSON.parse(responseText);
            console.log('📦 Parsed Response Data:', responseData);
        } catch (e) {
            console.error('❌ Failed to parse response as JSON:', e);
        }
        
        // Test through our API client
        console.log('3. Testing through API client...');
        const { apiClient } = await import('./src/services/api.js');
        const clientResponse = await apiClient.get('/v0/tenant');
        console.log('🔧 API Client Response:', clientResponse);
        
        return {
            user,
            token: token ? 'Present' : 'Not found',
            directResponse: responseData,
            clientResponse
        };
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        return { error: error.message };
    }
}

// Auto-run test
testApiResponse().then(result => {
    console.log('🎯 Test Results:', result);
}).catch(error => {
    console.error('💥 Test Error:', error);
});
