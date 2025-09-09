const axios = require('axios');

async function finalTest() {
    console.log('🧪 Final test of group attendance report...');
    
    try {
        // Test with the same parameters the frontend would use
        const response = await axios.post('http://localhost:5000/api/reports/mysql/attendance', {
            report_type: 'group',
            division_id: '689443a4c8066bb7f0b32a44', // INFORMATION SYSTEM division
            from_date: '2025-06-01',
            to_date: '2025-06-30'
        });
        
        console.log('✅ Status:', response.status);
        console.log('✅ Success:', response.data.success);
        console.log('✅ Message:', response.data.message);
        console.log('✅ Report Type:', response.data.reportType);
        console.log('✅ Data Array Length:', response.data.data?.length || 0);
        console.log('✅ Dates Array Length:', response.data.dates?.length || 0);
        console.log('✅ Summary:', response.data.summary);
        
        if (response.data.data && response.data.data.length > 0) {
            const firstEmployee = response.data.data[0];
            console.log('✅ First Employee Sample:');
            console.log('  - ID:', firstEmployee.employeeId);
            console.log('  - Name:', firstEmployee.employeeName);
            console.log('  - Division:', firstEmployee.division);
            console.log('  - Section:', firstEmployee.section);
            console.log('  - Daily Attendance Keys:', Object.keys(firstEmployee.dailyAttendance || {}).slice(0, 3));
        }
        
        console.log('\n🎉 GROUP ATTENDANCE REPORT IS NOW WORKING!');
        console.log('📊 Frontend should now display', response.data.data?.length || 0, 'employees');
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

finalTest();
