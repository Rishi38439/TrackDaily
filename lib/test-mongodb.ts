import { connectToDatabase } from './mongodb';
import { storeUserInfo, generateLogCode, getUserInfoByLogCode } from './userService';

// Test function to verify MongoDB setup
export async function testMongoDBConnection() {
  try {
    console.log('Testing MongoDB connection...');
    
    // Test database connection
    const db = await connectToDatabase();
    console.log('✅ Database connected successfully');
    
    // Test user info storage
    const testLogCode = generateLogCode();
    const testSessionId = 'test-session-' + Date.now();
    
    console.log('Testing user info storage...');
    const storedUser = await storeUserInfo(testLogCode, testSessionId);
    console.log('✅ User info stored:', storedUser);
    
    // Test user info retrieval
    console.log('Testing user info retrieval...');
    const retrievedUser = await getUserInfoByLogCode(testLogCode);
    console.log('✅ User info retrieved:', retrievedUser);
    
    if (retrievedUser && retrievedUser.log_code === testLogCode && retrievedUser.session_id === testSessionId) {
      console.log('🎉 MongoDB setup is working correctly!');
      return true;
    } else {
      console.log('❌ Data mismatch during retrieval');
      return false;
    }
    
  } catch (error) {
    console.error('❌ MongoDB test failed:', error);
    return false;
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testMongoDBConnection()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}
