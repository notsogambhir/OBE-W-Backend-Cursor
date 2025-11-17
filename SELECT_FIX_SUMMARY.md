# Select Component Empty String Value Fix

## Problem Description
The application was throwing React errors when using Select components in the Section Management interface:

```
Error: A <Select.Item /> must have a value prop that is not an empty string. This is because Select value can be set to an empty string to clear the selection and show placeholder.
```

## Root Cause
Radix UI Select components do not allow empty string values in SelectItem components. The issue occurred in two places:

1. **Section Management Component** - Student section assignment dropdown
2. **Teacher Assignment Component** - Section teacher assignment dropdown

## Fixes Applied

### 1. Section Management Component (`src/components/section-management.tsx`)

**Before:**
```tsx
<Select
  value={student.sectionId || ''}
  onValueChange={(value) => handleAssignStudentToSection(student.id, value || null)}
>
  <SelectContent>
    <SelectItem value="">Unassigned</SelectItem>
    {sections.map((section) => (
      <SelectItem key={section.id} value={section.id}>
        Section {section.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

**After:**
```tsx
<Select
  value={student.sectionId || 'unassigned'}
  onValueChange={(value) => handleAssignStudentToSection(student.id, value === 'unassigned' ? null : value)}
>
  <SelectContent>
    <SelectItem value="unassigned">Unassigned</SelectItem>
    {sections.map((section) => (
      <SelectItem key={section.id} value={section.id}>
        Section {section.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

### 2. Teacher Assignment Component (`src/components/teacher-assignment.tsx`)

**Before:**
```tsx
<Select
  value={sectionAssignments[section.id] || ''}
  onValueChange={(value) => handleSectionAssignmentChange(section.id, value)}
>
  <SelectContent>
    <SelectItem value="">Use Course Default</SelectItem>
    {availableTeachers.map((teacher) => (
      <SelectItem key={teacher.id} value={teacher.id}>
        {teacher.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

**After:**
```tsx
<Select
  value={sectionAssignments[section.id] || 'use_default'}
  onValueChange={(value) => handleSectionAssignmentChange(section.id, value)}
>
  <SelectContent>
    <SelectItem value="use_default">Use Course Default</SelectItem>
    {availableTeachers.map((teacher) => (
      <SelectItem key={teacher.id} value={teacher.id}>
        {teacher.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

### 3. Enhanced Save Logic for Teacher Assignment

Updated the save function to properly handle the new 'use_default' value:

```tsx
const handleSave = async () => {
  const payload = mode === 'single' 
    ? { mode, courseLevelTeacherId }
    : { 
        mode, 
        sectionAssignments: Object.entries(sectionAssignments)
          .filter(([_, teacherId]) => teacherId !== 'use_default')
          .map(([sectionId, teacherId]) => ({
            sectionId,
            teacherId
          }))
      };
  // ... rest of save logic
};
```

### 4. Updated Unsaved Changes Tracking

Modified the change detection logic to account for the new 'use_default' value:

```tsx
assignments.reduce((acc, assignment) => {
  if (assignment.sectionId) {
    acc[assignment.sectionId] = assignment.teacherId || 'use_default';
  }
  return acc;
}, {} as { [key: string]: string })
```

## Solution Benefits

1. **Eliminates React Errors**: No more SelectItem empty string value errors
2. **Maintains Functionality**: All existing behavior preserved
3. **Clear Semantics**: 'unassigned' and 'use_default' are more descriptive than empty strings
4. **Type Safety**: Better type safety with explicit non-empty string values
5. **Consistent Pattern**: Establishes a pattern for handling optional selections

## Testing

- ✅ Section Management loads without errors
- ✅ Student section assignment works correctly
- ✅ Teacher assignment loads without errors
- ✅ Section-based teacher assignment works correctly
- ✅ Save functionality handles 'use_default' values properly
- ✅ Unsaved changes detection works correctly

## Files Modified

1. `/src/components/section-management.tsx` - Fixed student section assignment Select
2. `/src/components/teacher-assignment.tsx` - Fixed teacher assignment Select and save logic

## Impact

These fixes resolve the immediate blocking error that prevented users from accessing the Section Management interface, allowing the Section feature to be fully functional as intended.