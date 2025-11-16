# Course Code Uniqueness in OBE Portal

## 📋 **Overview**

The OBE Portal correctly implements **batch-specific course code uniqueness**, which allows the same course code to exist in different batches while preventing duplicates within the same batch. This design aligns with real-world educational scenarios where:

- Course codes like "CS101" can be reused across different academic years/batches
- Each batch maintains its own unique set of course codes
- This prevents confusion while allowing code reuse across time

## 🏗️ **Database Schema**

The uniqueness is enforced at the database level through Prisma's unique constraint:

```prisma
model Course {
  id          String      @id @default(cuid())
  code        String
  name        String
  batchId     String      // Course belongs to a specific batch
  semester    String
  description String?
  status      CourseStatus @default(FUTURE)
  isActive    Boolean     @default(true)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  batch         Batch    @relation(fields: [batchId], references: [id])
  courseOutcomes CO[]
  assessments   Assessment[]
  enrollments   Enrollment[]
  
  @@unique([batchId, code])  // ✅ Key constraint: unique within each batch
  @@map("courses")
}
```

## 🔌 **API Validation**

The API enforces the same uniqueness rule:

```javascript
// From POST /api/courses/route.ts
const existingCourse = await db.course.findFirst({
  where: {
    code,
    batchId  // Check uniqueness within the specific batch
  }
});

if (existingCourse) {
  return NextResponse.json({ 
    error: 'Course with this code already exists in this batch' 
  }, { status: 409 });
}
```

## ✅ **Demonstrated Behavior**

### **✅ ALLOWED: Same Code in Different Batches**
- Course "CS101" can exist in both "2020-2024" and "2021-2025" batches
- Each course is considered distinct despite having the same code
- This allows for consistent course naming across academic years

### **❌ PREVENTED: Same Code in Same Batch**
- Course "CS101" cannot be created twice in "2020-2024" batch
- The system returns a 409 Conflict error with clear messaging
- This prevents confusion within the same academic cohort

### **✅ ALLOWED: Different Codes in Same Batch**
- Course "CS101" and "CS102" can coexist in the same batch
- This allows for multiple courses within the same academic period

## 🎯 **Real-World Examples**

### **Typical Course Code Patterns**
```
Batch 2020-2024: CS101, CS102, CS103, CS104
Batch 2021-2025: CS101, CS102, CS105, CS106
Batch 2022-2026: CS101, CS102, CS103, CS107
```

### **Benefits**
1. **Consistency**: Same course codes across years maintain curriculum continuity
2. **Flexibility**: Different batches can have different course offerings
3. **Clarity**: No confusion within the same academic year
4. **Scalability**: Supports multiple programs and batches with overlapping course codes

## 📊 **Technical Implementation**

### **Database Level**
- **Constraint**: `@@unique([batchId, code])`
- **Indexing**: Automatic index creation for performance
- **Enforcement**: Database-level constraint prevents violations

### **Application Level**
- **Validation**: API checks before database operations
- **Error Handling**: Clear error messages for duplicate attempts
- **User Feedback**: Frontend shows appropriate validation messages

### **Frontend Integration**
- **Form Validation**: Real-time validation feedback
- **Error Display**: User-friendly error messages
- **Batch Context**: Course codes are displayed with batch context

## 🔍 **Testing Results**

The system has been thoroughly tested and confirmed to work correctly:

1. ✅ **Same code, different batches**: Allowed
2. ✅ **Same code, same batch**: Prevented with proper error
3. ✅ **Different codes, same batch**: Allowed
4. ✅ **Retrieval**: Courses can be found by code across all batches
5. ✅ **Performance**: Efficient database queries with proper indexing

## 📝 **Current Status**

The course code uniqueness feature is **fully implemented and working correctly**. The system:

- ✅ **Enforces batch-specific uniqueness** at database and API levels
- ✅ **Allows code reuse** across different academic batches
- ✅ **Prevents duplicates** within the same batch
- ✅ **Provides clear error messages** for validation failures
- ✅ **Maintains data integrity** through proper constraints

This implementation supports the natural workflow of educational institutions where course codes remain consistent across years while each batch maintains its own unique course catalog.