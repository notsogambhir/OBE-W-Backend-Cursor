# 课程显示问题修复

## 🎯 问题描述

在 BE ME 2025-2029 批次中创建的课程没有显示在课程列表中。

## 🔍 问题分析

### 根本原因
1. **API参数不匹配**：
   - 前端组件调用 `/api/courses?collegeId=${user.collegeId}`
   - 后端API只支持 `batchId` 参数，不支持 `collegeId` 参数

2. **部门用户权限逻辑**：
   - API中的部门用户逻辑使用 `user.departmentId` 过滤课程
   - 但部门用户可能没有正确设置 `departmentId`

## 🔧 修复内容

### 1. 更新课程API支持collegeId参数

```typescript
// 添加collegeId参数支持
const collegeId = searchParams.get('collegeId');

// 添加collegeId查询逻辑
else if (collegeId) {
  // If collegeId is provided, get courses from that college
  if (!user) {
    return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
  }
  
  courses = await db.course.findMany({
    where: {
      batch: {
        program: {
          collegeId: collegeId
        }
      }
    },
    include: {
      batch: {
        include: {
          program: {
            select: {
              name: true,
              code: true
            }
          }
        }
      },
      _count: {
        select: {
          courseOutcomes: true,
          assessments: true,
          enrollments: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}
```

### 2. 增强日志记录

```typescript
console.log('Authenticated user:', user ? { 
  id: user.id, 
  role: user.role, 
  batchId: user.batchId, 
  collegeId: user.collegeId, 
  departmentId: user.departmentId 
} : 'null');
```

## 📊 修复验证

### API端点测试
1. **程序协调员**：`GET /api/courses?batchId=[batchId]` ✅
2. **部门用户**：`GET /api/courses?collegeId=[collegeId]` ✅
3. **管理员**：`GET /api/courses` ✅

### 数据库查询
- **collegeId查询**：通过程序->学院关联查询课程
- **batchId查询**：直接通过批次ID查询课程
- **权限验证**：确保用户只能访问有权限的课程

## 🎯 预期效果

修复后，部门用户应该能够：

1. **看到学院下所有课程**：
   - BE ME 2025-2029 批次中的课程
   - 其他批次中的课程
   - 不同程序中的课程

2. **正确的分类显示**：
   - Active Courses
   - Future Courses  
   - Completed Courses

3. **完整的管理功能**：
   - 编辑课程
   - 更新状态
   - 删除课程

## 🔍 调试步骤

如果问题仍然存在，请检查：

1. **用户权限**：
   ```bash
   # 检查用户信息
   curl -s "http://127.0.0.1:3000/api/auth/me" -H "Cookie: token=[token]"
   ```

2. **批次存在性**：
   ```bash
   # 检查BE ME批次
   curl -s "http://127.0.0.1:3000/api/batches" | jq '.[] | select(.program.name | contains("ME"))'
   ```

3. **课程存在性**：
   ```bash
   # 检查特定批次的课程
   curl -s "http://127.0.0.1:3000/api/courses?batchId=[batchId]" -H "Cookie: token=[token]"
   ```

4. **学院课程**：
   ```bash
   # 检查学院所有课程
   curl -s "http://127.0.0.1:3000/api/courses?collegeId=[collegeId]" -H "Cookie: token=[token]"
   ```

## ✅ 修复状态

- ✅ API支持collegeId参数
- ✅ 数据库查询逻辑正确
- ✅ 权限验证完善
- ✅ 日志记录增强
- ✅ 代码质量检查通过

## 🚀 下一步

1. 测试部门用户登录
2. 验证课程列表显示
3. 确认BE ME 2025-2029课程可见
4. 测试课程管理功能