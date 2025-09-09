const { generateMySQLGroupAttendanceReport } = require('./backend/controllers/reportController');

console.log('Testing group attendance function...');
console.log('Function imported:', typeof generateMySQLGroupAttendanceReport);

if (typeof generateMySQLGroupAttendanceReport === 'function') {
    console.log('✅ Function is properly exported and available');
} else {
    console.log('❌ Function is not available');
}
