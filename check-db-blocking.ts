import { db } from './src/lib/db';

async function checkDatabaseBlocking() {
  try {
    console.log('🔍 Checking for potential database blocking issues...\n');

    // 1. Check if there are any hanging transactions
    console.log('1. Testing database connection...');
    const startTime = Date.now();
    
    // Simple query test
    const userCount = await db.user.count();
    console.log(`   ✅ User count query: ${userCount} (${Date.now() - startTime}ms)`);
    
    // Test with timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database query timeout')), 5000);
    });
    
    const queryPromise = db.user.findMany({
      take: 10,
      select: { id: true, email: true, name: true }
    });
    
    try {
      const result = await Promise.race([queryPromise, timeoutPromise]);
      console.log(`   ✅ Complex query: ${result.length} users (${Date.now() - startTime}ms)`);
    } catch (error) {
      console.log(`   ❌ Database query failed: ${error.message}`);
    }

    // 2. Check for any long-running operations
    console.log('\n2. Checking for potential blocking operations...');
    
    // Test specific tables that might cause issues
    const tables = ['users', 'colleges', 'programs', 'batches', 'courses'];
    
    for (const table of tables) {
      try {
        const startTime = Date.now();
        const count = await (db as any)[table].count();
        const duration = Date.now() - startTime;
        console.log(`   ${table}: ${count} records (${duration}ms)`);
        
        if (duration > 1000) {
          console.log(`   ⚠️  Slow table: ${table} took ${duration}ms`);
        }
      } catch (error) {
        console.log(`   ❌ Error checking ${table}: ${error.message}`);
      }
    }

    // 3. Check database file size and permissions
    console.log('\n3. Database file analysis...');
    try {
      const fs = require('fs');
      const path = require('path');
      
      const dbPath = path.join(process.cwd(), 'db', 'custom.db');
      const stats = fs.statSync(dbPath);
      
      console.log(`   Database path: ${dbPath}`);
      console.log(`   File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Last modified: ${stats.mtime}`);
      console.log(`   Permissions: ${stats.mode.toString(8)}`);
      
    } catch (error) {
      console.log(`   ❌ Error checking database file: ${error.message}`);
    }

    // 4. Check for any corrupted data
    console.log('\n4. Checking for data corruption...');
    try {
      const recentUsers = await db.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
      });
      
      console.log(`   Recent users: ${recentUsers.length}`);
      recentUsers.forEach((user, index) => {
        console.log(`     ${index + 1}. ${user.name} (${user.email}) - Created: ${user.createdAt}`);
      });
      
    } catch (error) {
      console.log(`   ❌ Error checking recent users: ${error.message}`);
    }

    console.log('\n5. Server configuration check...');
    console.log(`   Node.js version: ${process.version}`);
    console.log(`   Available memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);

  } catch (error) {
    console.error('❌ Database check failed:', error);
  } finally {
    await db.$disconnect();
  }
}

checkDatabaseBlocking();