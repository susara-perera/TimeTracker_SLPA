const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

async function createSampleAttendance() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const User = require('./backend/models/User');
    const Attendance = require('./backend/models/Attendance');
    
    // Get users from Information System division
    const users = await User.find()
      .populate('division', 'name')
      .populate('section', 'name')
      .limit(5);
    
    console.log(`Found ${users.length} users`);
    
    if (users.length > 0) {
      // Create attendance records for the last 5 days
      const attendanceRecords = [];
      const today = new Date();
      
      for (let i = 0; i < 5; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        for (const user of users) {
          // Create check-in
          const checkInTime = new Date(date);
          checkInTime.setHours(9, Math.floor(Math.random() * 30), 0, 0); // 9:00-9:30 AM
          
          // Create check-out
          const checkOutTime = new Date(date);
          checkOutTime.setHours(17, Math.floor(Math.random() * 60), 0, 0); // 5:00-6:00 PM
          
          const workingHours = (checkOutTime - checkInTime) / (1000 * 60 * 60); // Convert to hours
          
          const attendanceRecord = {
            user: user._id,
            date: date,
            checkIn: {
              time: checkInTime,
              method: 'manual',
              location: 'Office'
            },
            checkOut: {
              time: checkOutTime,
              method: 'manual',
              location: 'Office'
            },
            status: 'present',
            workingHours: Math.round(workingHours * 100) / 100,
            overtime: workingHours > 8 ? Math.round((workingHours - 8) * 100) / 100 : 0,
            lateMinutes: checkInTime.getHours() > 9 ? (checkInTime.getHours() - 9) * 60 + checkInTime.getMinutes() : 0
          };
          
          attendanceRecords.push(attendanceRecord);
        }
      }
      
      // Insert attendance records
      await Attendance.insertMany(attendanceRecords);
      console.log(`Created ${attendanceRecords.length} attendance records`);
      
      // Show sample data
      const sampleAttendance = await Attendance.find()
        .populate('user', 'firstName lastName employeeId')
        .limit(3);
      
      console.log('Sample attendance records:');
      sampleAttendance.forEach(record => {
        console.log(`${record.user.employeeId} - ${record.user.firstName} ${record.user.lastName} - ${record.date.toDateString()} - ${record.status}`);
      });
    }
    
    await mongoose.disconnect();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createSampleAttendance();
