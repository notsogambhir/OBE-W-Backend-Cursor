# Batch-Based Course Management System

## Overview

This system implements a batch-based course management approach where **courses are unique to each batch**. This solves the problem where courses were being shared across different batches, ensuring that each batch has its own distinct course list.

## Key Features

### 1. Batch-Centric Architecture
- **Batch** is the main entity that contains courses
- Each batch belongs to a specific program
- Courses are created and managed within the context of a specific batch
- No course sharing between batches - each course is unique to its batch

### 2. Database Schema
```
Batch (Main Entity)
├── id
├── name (e.g., "2021-2025")
├── programId
├── startYear
├── endYear
└── courses (One-to-Many relationship)

Course (Batch Property)
├── id
├── code (unique within batch)
├── name
├── batchId (Foreign Key to Batch)
├── semester
├── status (FUTURE, ACTIVE, COMPLETED)
└── description
```

### 3. User Interface

#### Main Dashboard
- **Statistics Cards**: Show total batches, courses, and selected batch info
- **Batch List**: Left panel showing all available batches with course/student counts
- **Course Management**: Right panel showing courses for the selected batch

#### Batch Management
- Create new batches for specific programs
- View batch details (program, years, course count, student count)
- Select batches to manage their courses

#### Course Management
- Add courses to specific batches only
- Course status management (Future → Active → Completed)
- View course statistics (COs, Assessments, Enrollments)
- Delete courses (with validation)

### 4. API Endpoints

#### Batches
- `GET /api/batches` - Get all batches (with program and count info)
- `GET /api/batches?programId=<id>` - Get batches for specific program
- `POST /api/batches` - Create new batch

#### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses?batchId=<id>` - Get courses for specific batch
- `POST /api/courses` - Create course in specific batch
- `PATCH /api/courses/[id]/status` - Update course status
- `DELETE /api/courses/[id]` - Delete course

#### Programs
- `GET /api/programs` - Get all programs
- `GET /api/programs?collegeId=<id>` - Get programs for specific college

## How It Solves the Problem

### Before (Problem)
- Courses were shared across all batches
- Creating a course in one batch made it appear in all batches
- No batch-specific course management
- Course codes could conflict across batches

### After (Solution)
- **Each batch has its own unique course list**
- Courses are created **within the context of a specific batch**
- **Database constraints** ensure course codes are unique only within their batch
- **UI enforces batch selection** before course operations
- Clear separation of courses between different batches

## Key Implementation Details

### 1. Database Constraints
```sql
-- Unique constraint ensures course codes are unique within each batch
UNIQUE([batchId, code])
```

### 2. API Validation
- Course creation requires `batchId`
- Course code uniqueness checked within the batch context
- Batch existence validated before course operations

### 3. UI/UX Design
- **Two-panel layout**: Batch selection on left, course management on right
- **Visual feedback**: Selected batch highlighted
- **Status tabs**: Filter courses by status (All, Future, Active, Completed)
- **Contextual actions**: All course operations are batch-aware

### 4. Course Lifecycle
1. **Future**: Course planned but not yet active
2. **Active**: Course is running, students can be enrolled
3. **Completed**: Course finished, no further modifications

## Usage Workflow

1. **Select a Batch**: Choose which batch to manage from the left panel
2. **View Courses**: See all courses for that batch in the right panel
3. **Add Course**: Click "Add Course" to create a new course for that batch
4. **Manage Status**: Change course status as needed
5. **Delete Course**: Remove courses (with safety validations)

## Benefits

✅ **Batch Isolation**: Each batch has completely separate courses
✅ **Data Integrity**: Database constraints prevent cross-batch conflicts
✅ **Clear Organization**: Easy to understand which courses belong to which batch
✅ **Scalable**: Can handle multiple batches with different course offerings
✅ **User-Friendly**: Intuitive interface for batch and course management

## Technical Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite with proper foreign key relationships
- **Authentication**: Token-based auth with role-based access control

This system ensures that courses are properly scoped to their respective batches, eliminating the confusion of shared courses across different academic cohorts.