'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { storeUserInfo, generateLogCode, getUserInfoByLogCode } from '@/lib/userService';
import { UserInfo } from '@/types/activity';

export function MongoDBTest() {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const runTest = async () => {
    setIsLoading(true);
    setTestResult('Testing MongoDB connection...');
    
    try {
      // Test storing user info
      const logCode = generateLogCode();
      const sessionId = 'test-session-' + Date.now();
      
      setTestResult('Storing user info...');
      const storedUser = await storeUserInfo(logCode, sessionId);
      setUserInfo(storedUser);
      
      // Test retrieving user info
      setTestResult('Retrieving user info...');
      const retrievedUser = await getUserInfoByLogCode(logCode);
      
      if (retrievedUser && retrievedUser.log_code === logCode) {
        setTestResult(`✅ Success! Stored and retrieved user info:
- Log Code: ${logCode}
- Session ID: ${sessionId}
- Created: ${storedUser.createdAT.toLocaleString()}`);
      } else {
        setTestResult('❌ Test failed: Data mismatch during retrieval');
      }
    } catch (error) {
      setTestResult(`❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>MongoDB Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runTest} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Testing...' : 'Test MongoDB Connection'}
        </Button>
        
        {testResult && (
          <div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">
            {testResult}
          </div>
        )}
        
        {userInfo && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md text-sm">
            <strong>Stored User Info:</strong>
            <pre className="mt-1 text-xs">
              {JSON.stringify(userInfo, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
