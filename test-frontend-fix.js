const axios = require('axios');

async function testGroupAttendanceFixed() {
    console.log('Testing Group Attendance API with corrected port 5000...');
    
    try {
        // Test with June 2025 data (we know this has data)
        const response = await axios.post('http://localhost:5000/api/reports/mysql/attendance', {
            report_type: 'group',
            division_id: '689443a4c8066bb7f0b32a44', // MongoDB division ID for INFORMATION SYSTEM
            from_date: '2025-06-01',
            to_date: '2025-06-30',
            format: 'json'
        });
        
        console.log('✅ Response status:', response.status);
        console.log('✅ Response success:', response.data.success);
        console.log('✅ Number of employees:', response.data.summary?.totalEmployees || 0);
        console.log('✅ Division:', response.data.summary?.divisionInfo);
        
        if (response.data.data && response.data.data.length > 0) {
            console.log('✅ Sample employee:', {
                id: response.data.data[0].employeeId,
                name: response.data.data[0].employeeName,
                division: response.data.data[0].division,
                section: response.data.data[0].section
            });
        }
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        console.error('❌ Status:', error.response?.status);
    }
}

testGroupAttendanceFixed();
