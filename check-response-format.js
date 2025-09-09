const axios = require('axios');

async function checkResponseFormat() {
    console.log('Checking response format for frontend compatibility...');
    
    try {
        const response = await axios.post('http://localhost:5000/api/reports/mysql/attendance', {
            report_type: 'group',
            division_id: '689443a4c8066bb7f0b32a44', // MongoDB division ID for INFORMATION SYSTEM
            from_date: '2025-06-01',
            to_date: '2025-06-30'
        });
        
        console.log('Response structure:');
        console.log('- success:', response.data.success);
        console.log('- data array length:', response.data.data?.length || 0);
        console.log('- data exists:', !!response.data.data);
        console.log('- message:', response.data.message);
        console.log('- summary:', response.data.summary);
        
        // Check what the frontend will see
        const reportArray = Array.isArray(response.data.data) ? response.data.data : Array.isArray(response.data) ? response.data : [];
        console.log('- Frontend will see array length:', reportArray.length);
        
        if (response.data.data && response.data.data.length > 0) {
            console.log('- First employee structure:', Object.keys(response.data.data[0]));
        }
        
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

checkResponseFormat();
