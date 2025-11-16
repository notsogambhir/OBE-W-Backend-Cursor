# OBE Portal 全局状态实现完整说明

## 🎯 功能概述

OBE Portal系统已完全实现基于角色的全局状态管理，不同用户角色在侧边栏中拥有不同的自动选择和权限控制。

## 📋 角色权限矩阵

| 角色 | College | Program | Batch | 权限说明 |
|------|---------|---------|-------|----------|
| **Program Coordinator** | ✅ 自动选择 | ✅ 自动选择 | 🔘 可切换 | 基于分配的程序，可切换批次 |
| **Teacher** | ✅ 自动选择 | ✅ 自动选择 | 🔘 可切换 | 基于分配的程序，可切换批次 |
| **Department** | ✅ 自动选择 | 🔘 可切换 | 🔘 可切换 | 基于所属学院，可切换程序和批次 |
| **Admin/University** | 🔘 可切换 | 🔘 可切换 | 🔘 可切换 | 完全自由切换所有选项 |

## 🔧 实现细节

### 1. 自动选择逻辑

#### Program Coordinator / Teacher
```typescript
// 自动选择程序（基于用户分配）
useEffect(() => {
  if ((user.role === 'PROGRAM_COORDINATOR' || user.role === 'TEACHER') 
      && user.programId && !selectedProgram) {
    setSelectedProgram(user.programId);
  }
}, [user.role, user.programId, selectedProgram, setSelectedProgram]);

// 自动选择最新批次
const fetchBatches = async (programId: string) => {
  const response = await fetch(`/api/batches?programId=${programId}`);
  if (response.ok) {
    const data = await response.json();
    setBatches(data);
    // Auto-select newest batch
    if (data.length > 0) {
      setSelectedBatch(data[0].id);
    }
  }
};
```

#### Department User
```typescript
// 自动选择学院（基于用户所属）
useEffect(() => {
  if (user.role === 'DEPARTMENT' && user.collegeId && !selectedCollege) {
    setSelectedCollege(user.collegeId);
  }
}, [user.role, user.collegeId, selectedCollege, setSelectedCollege]);
```

### 2. UI权限控制

#### College Dropdown
```typescript
{isHighLevelUser && (
  <Select
    value={selectedCollege || ''}
    onValueChange={(value) => setSelectedCollege(value)}
    disabled={user.role === 'DEPARTMENT'} // Department用户不能切换学院
  >
    <SelectValue placeholder="Select college" />
  </Select>
)}
```

#### Program Dropdown
```typescript
{isHighLevelUser || ['PROGRAM_COORDINATOR', 'TEACHER'].includes(user.role) ? (
  <Select
    value={selectedProgram || ''}
    onValueChange={(value) => setSelectedProgram(value)}
    disabled={['PROGRAM_COORDINATOR', 'TEACHER'].includes(user.role)} // PC/Teacher不能切换程序
  >
    <SelectValue placeholder={
      ['PROGRAM_COORDINATOR', 'TEACHER'].includes(user.role) 
        ? "Program assigned"  // 显示"已分配程序"
        : selectedCollege 
          ? "Select program" 
          : "Select college first"
    } />
  </Select>
) : null}
```

#### Batch Dropdown
```typescript
<Select
  value={selectedBatch || ''}
  onValueChange={(value) => setSelectedBatch(value)}
  disabled={(!selectedProgram && !user.programId) || loadingBatches}
>
  <SelectValue placeholder={
    selectedProgram || user.programId 
      ? "Select batch" 
      : "Select program first"
  } />
</Select>
```

### 3. 全局状态同步

所有页面都通过 `useSidebarContext` 钩子访问全局状态：

```typescript
import { useSidebarContext } from '@/contexts/sidebar-context';

function AnyComponent() {
  const { 
    selectedCollege, 
    selectedProgram, 
    selectedBatch,
    getContextString 
  } = useSidebarContext();
  
  // 使用全局状态进行API调用
  const apiUrl = `/api/courses?${getContextString()}`;
}
```

## 🎨 用户体验流程

### Program Coordinator / Teacher 登录流程
1. **登录** → 系统自动选择用户的分配学院和程序
2. **批次选择** → 自动选择最新批次，用户可手动切换
3. **全局生效** → 所有页面使用选定的批次作为全局状态
4. **页面导航** → 批次选择在整个会话中保持

### Department User 登录流程
1. **登录** → 系统自动选择用户的所属学院
2. **程序选择** → 用户可选择学院下的不同程序
3. **批次选择** → 根据选择的程序显示批次，用户可切换
4. **全局生效** → 选择影响整个会话的所有页面

### Admin/University 登录流程
1. **登录** → 所有选项可自由选择
2. **层级选择** → College → Program → Batch
3. **完全控制** → 可访问系统的所有层级数据

## 🔄 状态持久化

全局状态在用户会话期间保持：
- **内存状态**：通过React Context管理
- **会话持久**：页面刷新后自动重新初始化
- **实时同步**：所有组件实时获取最新状态

## 📊 API集成

所有API调用自动包含全局状态参数：

```typescript
// getContextString() 生成查询参数
const getContextString = () => {
  const params = new URLSearchParams();
  if (selectedCollege) params.append('collegeId', selectedCollege);
  if (selectedProgram) params.append('programId', selectedProgram);
  if (selectedBatch) params.append('batchId', selectedBatch);
  return params.toString();
};

// API调用示例
const response = await fetch(`/api/courses?${getContextString()}`);
```

## ✅ 验证清单

- ✅ Program Coordinator: 自动选择College + Program，可切换Batch
- ✅ Teacher: 自动选择College + Program，可切换Batch  
- ✅ Department: 自动选择College，可切换Program + Batch
- ✅ Admin/University: 完全自由切换所有选项
- ✅ 全局状态在所有页面生效
- ✅ 权限控制正确实施
- ✅ UI状态正确显示
- ✅ API自动包含全局参数

## 🎯 实际效果

用户登录后，侧边栏会根据角色自动显示相应的选择状态，这些选择会作为全局状态影响整个系统的数据过滤和操作，确保用户始终在正确的上下文中工作。