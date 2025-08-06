# Time Attendance System

A comprehensive time and attendance management system built with the MERN stack (MongoDB, Express.js, React, Node.js) using MVS (Model-View-Service) architecture.

## Features

### Authentication & Authorization
- Multi-role login system (Super Admin, Administrator, Clerk)
- JWT-based authentication
- Role-based access control
- Password encryption and security features
- Account lockout protection

### User Management
- Employee registration and profile management
- Role assignment and permissions
- Department and section assignment
- User activity tracking

### Attendance Tracking
- Clock in/out functionality
- Break management
- Working hours calculation
- Overtime tracking
- Attendance statistics

### Division & Section Management
- Organizational structure management
- Employee assignment to divisions/sections
- Capacity management
- Performance tracking

### Meal Management
- Meal booking system
- Menu planning and management
- Nutritional information tracking
- Rating and feedback system
- Meal statistics

### Reporting System
- Unit attendance reports
- Audit reports
- Meal reports
- User activity reports
- Custom report generation
- Export functionality (PDF, Excel)

### System Settings
- Configurable system parameters
- Security settings
- Notification preferences
- Data backup and restore

### Audit & Security
- Comprehensive audit logging
- Security monitoring
- Data integrity checks
- Access tracking

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **helmet** - Security headers
- **cors** - Cross-origin resource sharing
- **moment.js** - Date manipulation

### Frontend (To be implemented)
- **React** - UI library
- **Redux/Context API** - State management
- **React Router** - Routing
- **Axios** - HTTP client
- **Bootstrap/Material-UI** - UI components

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Time_Attendance_System
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Environment Configuration**
   
   The `.env` file is already configured in the backend folder with MongoDB Atlas connection:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database Configuration (MongoDB Atlas)
   MONGODB_URI=mongodb+srv://SLPA:248310@payment.ydeh3.mongodb.net/SLPA
   MONGODB_TEST_URI=mongodb+srv://SLPA:248310@payment.ydeh3.mongodb.net/SLPA_TEST
   
   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
   JWT_EXPIRE=24h
   
   # Default Super Admin
   DEFAULT_ADMIN_EMAIL=superadmin@company.com
   DEFAULT_ADMIN_PASSWORD=SuperAdmin123!
   
   # Session Secret
   SESSION_SECRET=your_session_secret_here
   
   # Rate Limiting
   RATE_LIMIT_WINDOW=15
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **MongoDB Atlas Connection**
   
   The system is configured to use MongoDB Atlas cloud database:
   - **Database:** SLPA
   - **Connection:** Already configured in .env
   - **Auto-initialization:** Default super admin will be created on first run

5. **Run the backend server**
   ```bash
   # From the root directory
   npm run server-only
   
   # Or from the backend directory
   cd backend
   npm run dev
   
   # Production mode
   npm start
   ```

The backend server will start on `http://localhost:5000`

### API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password

#### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get single user
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `PATCH /api/users/:id/toggle-status` - Toggle user status

#### Attendance
- `POST /api/attendance/checkin` - Check in
- `POST /api/attendance/checkout` - Check out
- `POST /api/attendance/break-start` - Start break
- `POST /api/attendance/break-end` - End break
- `GET /api/attendance/my-records` - Get user's attendance
- `GET /api/attendance/records` - Get all attendance records
- `GET /api/attendance/stats` - Get attendance statistics

#### Divisions
- `GET /api/divisions` - Get all divisions
- `GET /api/divisions/:id` - Get single division
- `POST /api/divisions` - Create division
- `PUT /api/divisions/:id` - Update division
- `DELETE /api/divisions/:id` - Delete division

#### Sections
- `GET /api/sections` - Get all sections
- `GET /api/sections/:id` - Get single section
- `POST /api/sections` - Create section
- `PUT /api/sections/:id` - Update section
- `DELETE /api/sections/:id` - Delete section

#### Meals
- `GET /api/meals` - Get all meals
- `GET /api/meals/:id` - Get single meal
- `POST /api/meals` - Create meal
- `POST /api/meals/:id/book` - Book meal
- `DELETE /api/meals/:id/cancel-booking` - Cancel booking
- `POST /api/meals/:id/rate` - Rate meal

#### Reports
- `GET /api/reports/attendance` - Attendance report
- `GET /api/reports/audit` - Audit report
- `GET /api/reports/meal` - Meal report
- `GET /api/reports/unit-attendance` - Unit attendance report
- `GET /api/reports/export/:reportType` - Export reports

#### Settings
- `GET /api/settings` - Get all settings
- `PUT /api/settings` - Update settings
- `POST /api/settings/reset` - Reset to defaults
- `GET /api/settings/export` - Export settings
- `POST /api/settings/import` - Import settings

## Default Login Credentials

After setting up the system, you can log in with the default super admin account:

- **Email:** superadmin@company.com
- **Password:** SuperAdmin123!

**Important:** Change the default password immediately after first login for security.

## Database Schema

The system uses the following main collections:

- **users** - User accounts and profiles
- **attendances** - Attendance records
- **divisions** - Organizational divisions
- **sections** - Sub-divisions/sections
- **meals** - Meal information and bookings
- **auditlogs** - System audit trail
- **settings** - System configuration

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- XSS protection
- SQL injection prevention
- Audit logging
- Account lockout protection
- Password complexity requirements

## Development

### Running Tests
```bash
npm test
```

### Code Linting
```bash
npm run lint
```

### Database Seeding
```bash
npm run seed
```

## Deployment

### Production Environment

1. Set `NODE_ENV=production` in your environment variables
2. Use a production MongoDB instance
3. Configure proper security settings
4. Set up SSL certificates
5. Use a process manager like PM2

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://your-production-mongo-uri
JWT_SECRET=your-super-secure-production-jwt-secret
# ... other production configs
```

## API Documentation

For detailed API documentation, visit `/api-docs` when the server is running (if Swagger is configured).

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.

## Version History

- **v1.0.0** - Initial release with core functionality
  - User authentication and authorization
  - Attendance tracking
  - Basic reporting
  - Division and section management
  - Meal management system
  - Audit logging
  - System settings

## Roadmap

- [ ] Frontend implementation with React
- [ ] Mobile app development
- [ ] Advanced reporting and analytics
- [ ] Integration with biometric devices
- [ ] Multi-language support
- [ ] Advanced workflow management
- [ ] API rate limiting improvements
- [ ] Real-time notifications
