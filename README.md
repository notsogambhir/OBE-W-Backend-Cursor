# OBE Portal - Outcome-Based Education Management System

A comprehensive NBA-compliant Outcome-Based Education portal for universities, built with Next.js 15, TypeScript, and modern web technologies.

## Features

### Multi-Role Authentication System
- **5 User Roles**: Admin, University, Department, Program Coordinator (PC), Teacher
- **College-based access control** with validation
- **Role-based routing** and permissions

### Academic Structure Management
- **College Management**: CUIET, CBS, CCP
- **Program Management**: 
  - CUIET: BE ME (4 years), BE ECE (4 years)
  - CBS: BBA (3 years), MBA Global (2 years)  
  - CCP: B. Pharma (3 years), M. Pharma (2 years)
- **Batch Management**: Academic year tracking
- **Department Organization**: Hierarchical structure

### User Management
- **Admin Controls**: Create colleges, programs, batches, and users
- **Department Validation**: Restricted access by college
- **Program Assignment**: PC and Teacher role assignments

### OBE Compliance Features
- **Course Outcomes (COs)**: Define and manage course-level outcomes
- **Program Outcomes (POs)**: Program-level outcome definitions
- **Program Educational Objectives (PEOs)**: Long-term educational goals
- **CO-PO Mapping**: Correlation matrices for outcome alignment
- **NBA Compliance**: Built-in compliance tracking

### Dashboard & Analytics
- **Role-specific dashboards** with relevant metrics
- **Real-time statistics** and performance indicators
- **Activity tracking** and notifications
- **Quick actions** for common tasks

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (New York style)
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT-based auth system
- **State Management**: React Context + Zustand patterns
- **Icons**: Lucide React

## Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd obe-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Seed the database with initial data**
   ```bash
   npx tsx src/lib/seed.ts
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`

## Default Login Credentials

After seeding the database, you can use these credentials:

### Admin Access
- **Email**: admin@obeportal.com
- **Password**: password123
- **Role**: System Administrator

### University Access
- **Email**: university@obeportal.com
- **Password**: password123
- **Role**: University Admin

### Department Access
- **CSE Department**: cse@obeportal.com / password123
- **Business Department**: business@obeportal.com / password123
- **Role**: Department Head

### Program Coordinator Access
- **BE ME PC**: pc.beme@obeportal.com / password123
- **BBA PC**: pc.bba@obeportal.com / password123
- **Role**: Program Coordinator

### Teacher Access
- **Teacher 1**: teacher1@obeportal.com / password123
- **Teacher 2**: teacher2@obeportal.com / password123
- **Role**: Teacher

## Application Flow

### Login Process
1. **College Selection**: Choose from CUIET, CBS, or CCP
2. **Authentication**: Email and password validation
3. **Role-based Routing**: 
   - Admin/University/Department → Direct to dashboard
   - PC/Teacher → Program selection screen

### Program Selection (PC/Teacher only)
1. **Program List**: Shows programs based on selected college
2. **Selection**: Choose assigned program
3. **Navigation**: Proceed to dashboard

### Batch Selection
1. **Modal Popup**: Select academic batch
2. **Context Setting**: Establish working context
3. **Dashboard Access**: Full system access

### Dashboard Navigation
- **Sidebar Navigation**: Role-based menu items
- **Main Content Area**: Dynamic content based on selection
- **User Profile**: Logout and account management

## Role-Based Access Control

### Admin
- ✅ User Management (Create, Edit, Delete users)
- ✅ College Management (Create, Edit colleges)
- ✅ Program Management (Create, Edit programs)
- ✅ Batch Management (Create, Edit batches)
- ✅ System-wide analytics
- ✅ All dashboard features

### University
- ✅ View all colleges and programs
- ✅ Academic structure oversight
- ✅ University-level analytics
- ✅ Department coordination
- ❌ User management

### Department
- ✅ Department-specific programs and batches
- ✅ Faculty management within department
- ✅ Department-level analytics
- ✅ Course oversight
- ❌ Cross-department access

### Program Coordinator
- ✅ Program-specific management
- ✅ Course coordination
- ✅ CO-PO mapping management
- ✅ Program analytics
- ❌ User management

### Teacher
- ✅ Assigned course management
- ✅ CO definition and management
- ✅ Student performance tracking
- ✅ Course-specific analytics
- ❌ Administrative functions

## Database Schema

### Core Entities
- **Users**: Authentication and role management
- **Colleges**: Institutional organization
- **Departments**: Academic departments
- **Programs**: Academic programs with duration
- **Batches**: Academic year cohorts
- **Courses**: Individual course offerings
- **COs**: Course Outcomes
- **POs**: Program Outcomes
- **PEOs**: Program Educational Objectives
- **CO-PO Mappings**: Outcome correlations

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/update-program` - Update user program
- `POST /api/auth/update-batch` - Update user batch

### Data Management
- `GET /api/colleges` - List colleges
- `GET /api/programs` - List programs by college
- `GET /api/batches` - List batches by program

## Development

### Code Quality
```bash
npm run lint        # Run ESLint
npm run build       # Build for production
```

### Database Operations
```bash
npm run db:push     # Push schema changes
npm run db:studio   # Open Prisma Studio
```

### Project Structure
```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
│   ├── ui/            # shadcn/ui components
│   └── *.tsx          # Custom components
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
│   ├── auth.ts        # Authentication logic
│   ├── db.ts          # Database client
│   └── seed.ts        # Database seeding
└── prisma/            # Database schema
    └── schema.prisma  # Prisma schema
```

## Contributing

1. Follow the existing code style and patterns
2. Use TypeScript for all new code
3. Test thoroughly before submitting changes
4. Update documentation as needed

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Note**: This is a comprehensive OBE portal designed to meet NBA accreditation requirements. The system is built with scalability and maintainability in mind, following modern web development best practices.