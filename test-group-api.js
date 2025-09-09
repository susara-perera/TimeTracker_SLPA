const axios = require('axios');

async function testGroupAttendanceAPI() {
    console.log('Testing Group Attendance API...');
    
    try {
        // Test the group attendance report endpoint
        const response = await axios.post('http://localhost:5000/api/reports/mysql/attendance', {
            report_type: 'group',
            division_id: '689443a4c8066bb7f0b32a44', // MongoDB division ID for INFORMATION SYSTEM
            from_date: '2025-01-01',
            to_date: '2025-01-31',
            format: 'json'
        });
        
        console.log('Response status:', response.status);
        console.log('Response data:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        console.error('Status:', error.response?.status);
    }
}

testGroupAttendanceAPI();
