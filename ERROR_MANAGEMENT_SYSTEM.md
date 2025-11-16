# Error Management System Documentation

## Overview

This document describes the comprehensive error management and logging system implemented for the OBE Portal. The system provides detailed logging, error tracking, notification management, and monitoring capabilities.

## Components

### 1. Logger Utility (`src/lib/logger.ts`)

A comprehensive logging system with multiple log levels and output destinations.

#### Features:
- **Log Levels**: ERROR, WARN, INFO, DEBUG
- **Multiple Outputs**: Console, file storage, remote logging
- **Context Tracking**: Add context to logs for better categorization
- **Metadata Support**: Attach additional data to log entries
- **Session Tracking**: Unique session IDs for request correlation
- **Buffered Logging**: Efficient batch processing of log entries

#### Usage Examples:

```typescript
import { logger, logError, logWarn, logInfo, logDebug } from '@/lib/logger';

// Basic logging
logger.error('Something went wrong', {
  context: 'user_action',
  userId: 'user123',
  metadata: { action: 'login', ip: '192.168.1.1' }
});

// Specialized logging methods
logger.apiError('POST', '/api/users', error, {
  statusCode: 500,
  requestBody: { email: 'test@example.com' }
});

logger.authError('login_failed', error, {
  email: 'test@example.com',
  ip: '192.168.1.1'
});

logger.databaseError('user_insert', error, {
  table: 'users',
  query: 'INSERT INTO users...'
});

logger.performanceMetric('user_login', 1250, {
  metadata: { method: 'oauth', browser: 'Chrome' }
});
```

### 2. Error Boundary (`src/components/error-boundary.tsx`)

React error boundary component with comprehensive error handling and logging.

#### Features:
- **Automatic Error Capture**: Catches React render errors
- **Error Reporting**: Generates detailed error reports
- **Retry Mechanism**: Allows users to retry failed operations
- **Development Details**: Shows full error details in development
- **Error Recovery**: Provides options for error recovery

#### Usage Examples:

```typescript
import { ErrorBoundary, useErrorHandler } from '@/components/error-boundary';

// Wrap components with error boundary
<ErrorBoundary context="user_profile" showDetails={true}>
  <UserProfile />
</ErrorBoundary>

// Use error handler hook
const handleError = useErrorHandler();

try {
  riskyOperation();
} catch (error) {
  handleError(error, 'user_action', { 
    operation: 'profile_update',
    userId: user.id 
  });
}

// HOC for components
const SafeComponent = withErrorBoundary(MyComponent, {
  context: 'safe_component',
  showDetails: process.env.NODE_ENV === 'development'
});
```

### 3. API Logger (`src/lib/api-logger.ts`)

Server-side middleware for API request/response logging and error handling.

#### Features:
- **Request/Response Logging**: Automatic logging of all API calls
- **Performance Monitoring**: Track slow API requests
- **Error Categorization**: Classify different types of errors
- **Request Correlation**: Track requests with unique IDs
- **Security Event Logging**: Monitor security-related events

#### Usage Examples:

```typescript
import { withLogging, createRequestContext, authLogger, databaseLogger } from '@/lib/api-logger';

// Wrap API handlers
export const POST = withLogging(async (request: NextRequest) => {
  const { requestId } = createRequestContext(request);
  
  // Your API logic here
  const user = await authenticateUser(email, password);
  
  return NextResponse.json({ user });
});

// Specialized logging
authLogger('login_failed', error, {
  email: 'test@example.com',
  ip: '192.168.1.1'
});

databaseLogger('query_failed', error, {
  query: 'SELECT * FROM users',
  table: 'users'
});
```

### 4. Client Error Tracker (`src/lib/client-error-tracker.ts`)

Client-side error tracking and monitoring system.

#### Features:
- **Console Error Capture**: Intercept console errors and warnings
- **Unhandled Promise Rejection**: Catch unhandled promise rejections
- **Network Error Monitoring**: Monitor failed API requests
- **Performance Tracking**: Track page load and interaction performance
- **User Interaction Tracking**: Monitor user actions and behavior

#### Usage Examples:

```typescript
import { errorTracker, useErrorTracking } from '@/lib/client-error-tracker';

// Automatic tracking (initialized on import)
// All unhandled errors will be automatically tracked

// React hook for manual tracking
const { trackError, trackEvent, trackPerformance } = useErrorTracking();

// Track custom errors
trackError(error, 'form_validation', {
  field: 'email',
  value: 'invalid-email'
});

// Track custom events
trackEvent('button_click', {
  buttonId: 'submit-form',
  page: 'login'
});

// Track performance
trackPerformance('form_submission', 250, {
  formType: 'user_registration'
});
```

### 5. Notification System (`src/lib/notification-system.ts`)

Comprehensive notification system for critical errors and user alerts.

#### Features:
- **Multiple Channels**: Desktop notifications, in-app alerts, toast messages
- **Critical Error Detection**: Automatically detects and alerts on critical errors
- **Notification Management**: Add, remove, and clear notifications
- **Persistent Notifications**: Keep important errors visible
- **Actionable Notifications**: Include actions for error resolution

#### Usage Examples:

```typescript
import { 
  NotificationProvider, 
  NotificationContainer,
  useNotifications,
  notifyError, 
  notifyWarning, 
  notifySuccess, 
  notifyInfo 
} from '@/lib/notification-system';

// Wrap app with provider
<NotificationProvider>
  <App />
  <NotificationContainer />
</NotificationProvider>

// Use notifications in components
const { addNotification, removeNotification } = useNotifications();

// Add custom notification
addNotification({
  type: 'warning',
  title: 'Action Required',
  message: 'Please verify your email address',
  persistent: true,
  actions: [
    {
      label: 'Verify Now',
      action: () => router.push('/verify-email'),
      variant: 'default'
    }
  ]
});

// Convenience functions
notifyError('Login failed', {
  context: 'auth',
  metadata: { attempt: 3 }
});

notifySuccess('Profile updated successfully');
```

### 6. Error Dashboard (`src/components/error-dashboard.tsx`)

Comprehensive dashboard for monitoring and analyzing application errors.

#### Features:
- **Real-time Monitoring**: Live view of application errors
- **Advanced Filtering**: Filter by level, context, time range, search
- **Error Analytics**: Analyze error patterns and trends
- **Performance Metrics**: Monitor system performance
- **Export Capabilities**: Export logs for external analysis

#### Dashboard Sections:

1. **Overview**: Total errors, critical errors, warnings, info logs
2. **Recent Errors**: Latest error occurrences with details
3. **Analytics**: 
   - Errors by context (auth, database, API, etc.)
   - Errors by hour (last 24 hours)
   - Top recurring issues
4. **All Logs**: Complete log view with filtering

## Configuration

### Environment Variables

```bash
# Enable/disable features based on environment
NODE_ENV=development|production

# Remote logging endpoint (optional)
REMOTE_LOGGING_ENDPOINT=https://your-logging-service.com/api/logs

# Log level configuration
LOG_LEVEL=debug|info|warn|error
```

### Logger Configuration

```typescript
const logger = new Logger({
  level: LogLevel.INFO,           // Minimum log level
  enableConsole: true,          // Console output
  enableFile: true,            // Local file storage
  enableRemote: false,          // Remote logging service
  remoteEndpoint: 'https://api.logs.com',
  maxFileSize: 10 * 1024 * 1024,  // 10MB
  maxFiles: 5                   // Keep 5 log files
});
```

### Notification Configuration

```typescript
const notificationSystem = new ErrorNotificationSystem({
  enableDesktop: true,           // Browser notifications
  enableSound: true,            // Audio alerts
  enableToast: true,            // Toast messages
  enableInApp: true,            // In-app notifications
  desktopTitle: 'OBE Portal Alert',
  soundUrl: '/sounds/alert.mp3',
  autoCloseDelay: 5000,         // Auto-close delay
  maxNotifications: 50           // Max notifications
});
```

## Integration Guide

### 1. Basic Setup

```typescript
// 1. Wrap your app with providers
<ErrorBoundary context="root">
  <NotificationProvider>
    <App />
    <NotificationContainer />
  </NotificationProvider>
</ErrorBoundary>

// 2. Initialize error tracking
import { errorTracker } from '@/lib/client-error-tracker';
// Error tracking starts automatically

// 3. Use logging throughout your app
import { logger } from '@/lib/logger';
logger.info('Application started');
```

### 2. API Integration

```typescript
// Wrap all API routes with logging
import { withLogging } from '@/lib/api-logger';

export const GET = withLogging(async (request) => {
  // Your API logic
  return NextResponse.json(data);
});
```

### 3. Component Integration

```typescript
// Wrap components with error boundaries
<ErrorBoundary context="component_name">
  <RiskyComponent />
</ErrorBoundary>

// Use error tracking in components
const { trackError } = useErrorTracking();

try {
  await riskyOperation();
} catch (error) {
  trackError(error, 'component_operation');
}
```

## Best Practices

### 1. Log Levels
- **ERROR**: System failures, exceptions, critical issues
- **WARN**: Deprecated features, performance issues, security concerns
- **INFO**: Important events, user actions, state changes
- **DEBUG**: Detailed debugging information (development only)

### 2. Context Usage
Use descriptive context names:
- `auth` - Authentication and authorization
- `database` - Database operations
- `api_request` - Incoming API requests
- `api_response` - API responses
- `user_action` - User interactions
- `performance` - Performance metrics
- `security` - Security events

### 3. Metadata Guidelines
Include relevant metadata:
```typescript
logger.error('Database operation failed', {
  context: 'database',
  metadata: {
    operation: 'user_insert',
    table: 'users',
    query: 'INSERT INTO users...',
    duration: 1250,
    userId: 'user123',
    requestId: 'req_123'
  }
});
```

### 4. Error Handling
- Always log errors with context
- Include user ID when available
- Add request ID for correlation
- Provide actionable error messages
- Use specialized logging methods when applicable

## Monitoring and Alerting

### 1. Critical Error Detection
The system automatically detects critical errors:
- Authentication failures
- Database connection issues
- Security violations
- System-level failures

### 2. Real-time Notifications
- Desktop notifications for critical errors
- In-app notifications for all errors
- Toast notifications for user feedback
- Persistent notifications for unresolved issues

### 3. Performance Monitoring
- API response time tracking
- Page load performance
- User interaction timing
- Long task detection

## Troubleshooting

### Common Issues

1. **Logs not appearing**: Check log level configuration
2. **Notifications not working**: Verify browser permissions
3. **Error boundary not catching**: Ensure proper component wrapping
4. **Performance data missing**: Check browser API support

### Debug Information

```typescript
// Check logger status
console.log('Log level:', logger.getLevel());
console.log('Session ID:', logger.getSessionId());

// Check error tracker status
console.log('Error tracker active:', errorTracker !== null);

// View recent logs
const recentLogs = logger.getLogs(LogLevel.ERROR);
console.log('Recent errors:', recentLogs);
```

## Security Considerations

1. **Sensitive Data**: Avoid logging passwords, tokens, or PII
2. **Log Access**: Implement proper access controls for log viewing
3. **Log Storage**: Use secure storage for log files
4. **Remote Logging**: Use HTTPS for remote log transmission
5. **Data Retention**: Implement log rotation and cleanup policies

## Production Deployment

### 1. Configuration
```typescript
const logger = new Logger({
  level: LogLevel.INFO,           // Production: INFO or higher
  enableConsole: false,         // Production: Disable console
  enableFile: true,             // Production: Enable file logging
  enableRemote: true,           // Production: Enable remote logging
  remoteEndpoint: process.env.LOGGING_ENDPOINT
});
```

### 2. Environment Variables
```bash
NODE_ENV=production
LOG_LEVEL=info
REMOTE_LOGGING_ENDPOINT=https://your-log-service.com/api/logs
ENABLE_CONSOLE_LOGGING=false
```

### 3. Monitoring Setup
- Set up log aggregation service
- Configure alerting for critical errors
- Monitor system performance metrics
- Implement log rotation and cleanup

## Support and Maintenance

### Log Analysis
- Use the error dashboard for visual analysis
- Export logs for external analysis tools
- Set up automated reporting
- Monitor error trends and patterns

### Performance Optimization
- Monitor log volume and performance
- Optimize logging frequency
- Implement log sampling for high-traffic scenarios
- Use asynchronous logging where possible

This comprehensive error management system provides robust monitoring, logging, and notification capabilities for the OBE Portal, ensuring quick detection and resolution of issues while maintaining excellent user experience.