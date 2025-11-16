# NBA-Compliant CO-PO Mapping System

## Overview
This CO-PO mapping system follows the National Board of Accreditation (NBA) guidelines for calculating Program Outcome (PO) attainments from Course Outcome (CO) mappings.

## NBA Guidelines for CO-PO Mapping

### 1. Mapping Levels
The NBA defines correlation levels between COs and POs:

- **Level 3 (Strong)**: Direct correlation, CO substantially contributes to PO
- **Level 2 (Medium)**: Moderate correlation, CO partially contributes to PO  
- **Level 1 (Weak)**: Slight correlation, CO minimally contributes to PO
- **Level 0 (None)**: No correlation between CO and PO

### 2. PO Attainment Calculation

#### Step-by-Step NBA Calculation:

1. **Calculate Average Mapping Level**
   ```
   Avg Mapping Level = Σ(Mapping Levels) / Number of Mapped COs
   ```

2. **Convert to Base Attainment**
   ```
   Level 3 = 100% attainment
   Level 2 = 75% attainment  
   Level 1 = 50% attainment
   ```

3. **Apply CO Coverage Factor**
   ```
   CO Coverage = Number of Mapped COs / Total COs in Course
   Final PO Attainment = Base Attainment × CO Coverage
   ```

4. **Determine Attainment Level**
   ```
   Level 3: 80-100% - Excellent attainment
   Level 2: 65-79% - Good attainment
   Level 1: 60-64% - Minimum attainment
   Not Attained: < 60% - Below minimum
   ```

### 3. NBA Compliance Requirements

- **Minimum Target**: 60% attainment for each PO
- **Overall Compliance**: Minimum 60% of POs must meet target
- **Documentation**: All mappings must be documented and justified
- **Verification**: Regular review and validation required

## Implementation Details

### Frontend Component Features

#### 1. **Interactive Mapping Matrix**
- Visual CO-PO mapping table
- Dropdown selectors for correlation levels (0-3)
- Real-time mapping updates
- Color-coded mapping levels

#### 2. **NBA Guidelines Display**
- Toggle-able information panel
- Clear level definitions
- Calculation methodology explanation
- Compliance requirements

#### 3. **PO Attainment Dashboard**
- Overall statistics and compliance score
- Individual PO attainment results
- Progress bars and visual indicators
- NBA compliance summary

#### 4. **Advanced Features**
- NBA-compliant calculation engine
- Automatic PO attainment calculation
- Detailed compliance analysis
- Recommendations for improvement
- CSV report generation

### Backend API Implementation

#### 1. **PO Attainment API**
- **Endpoint**: `GET /api/courses/[courseId]/po-attainments`
- **NBA-compliant calculation logic**
- Comprehensive compliance analysis
- Automated recommendations

#### 2. **Calculation Logic**
```typescript
// NBA PO Attainment Calculation
const avgMappingLevel = mappedCOs > 0 
  ? relatedMappings.reduce((sum, m) => sum + m.level, 0) / mappedCOs 
  : 0;

// Convert mapping level to attainment percentage
let baseAttainment = 0;
if (avgMappingLevel >= 3) baseAttainment = 100;
else if (avgMappingLevel >= 2) baseAttainment = 75;
else if (avgMappingLevel >= 1) baseAttainment = 50;

// Apply CO coverage factor
const coCoverageFactor = course.courseOutcomes.length > 0 
  ? mappedCOs / course.courseOutcomes.length 
  : 0;

// Final PO attainment
const actualAttainment = Math.round(baseAttainment * coCoverageFactor);
```

#### 3. **Compliance Analysis**
- Total POs and attainment breakdown
- Level-wise distribution
- Overall compliance score
- Automated recommendations
- NBA compliance verification

## User Interface

### 1. **Mapping Matrix**
- Clean, intuitive table layout
- Color-coded mapping levels
- Responsive design for all devices
- Real-time updates

### 2. **Results Dashboard**
- Visual progress indicators
- Comprehensive statistics
- NBA compliance status
- Individual PO details

### 3. **NBA Guidelines Panel**
- Educational information display
- Toggle for better UX
- Clear level definitions
- Calculation methodology

## Usage Instructions

### 1. **Access CO-PO Mapping**
1. Navigate to course management page
2. Click on "CO-PO Mapping" tab
3. Review NBA guidelines if needed

### 2. **Create Mappings**
1. Select correlation level for each CO-PO pair
2. Use dropdown menus for easy selection
3. Review mapping matrix for completeness

### 3. **Calculate PO Attainments**
1. Click "Calculate PO Attainments" button
2. System performs NBA-compliant calculations
3. Review results and compliance status

### 4. **Save and Export**
1. Click "Save Mappings" to persist changes
2. Use "Download Report" for documentation
3. Export CSV for external analysis

## NBA Compliance Checklist

### ✅ **Required for NBA Compliance**
- [ ] All POs have minimum 60% attainment
- [ ] Overall compliance score ≥ 60%
- [ ] Proper CO-PO correlation documentation
- [ ] Regular review and validation
- [ ] Justification for mapping levels

### ✅ **Best Practices**
- [ ] Use Level 2-3 correlations where appropriate
- [ ] Ensure comprehensive CO coverage
- [ ] Document mapping rationale
- [ ] Regularly review and update mappings
- [ ] Maintain audit trail of changes

## Technical Specifications

### Data Model
- **CO-PO Mapping**: Stores correlation levels (0-3)
- **PO Attainment**: Calculated results with status
- **Compliance Analysis**: Overall NBA compliance metrics

### API Endpoints
- `GET /api/courses/[courseId]/po-attainments` - Calculate PO attainments
- `POST /api/courses/[courseId]/po-attainments` - Advanced operations

### Frontend Components
- Interactive mapping matrix
- Real-time calculation engine
- NBA compliance dashboard
- Export functionality

## Benefits

### 1. **NBA Compliance**
- Ensures adherence to NBA standards
- Automated compliance checking
- Comprehensive reporting
- Audit-ready documentation

### 2. **User Experience**
- Intuitive interface
- Real-time feedback
- Visual indicators
- Educational guidance

### 3. **Data Accuracy**
- Standardized calculations
- Consistent methodology
- Reliable results
- Error prevention

### 4. **Efficiency**
- Automated calculations
- Bulk operations
- Quick updates
- Streamlined workflow

## Future Enhancements

### Planned Features
- Advanced analytics dashboard
- Historical tracking
- Benchmarking tools
- Integration with assessment systems
- Mobile app support

### Potential Improvements
- AI-powered mapping suggestions
- Predictive analytics
- Enhanced reporting
- Integration with LMS systems

---

This CO-PO mapping system provides a comprehensive, NBA-compliant solution for calculating and managing Program Outcome attainments, ensuring educational institutions meet accreditation requirements while providing an intuitive and efficient user experience.