import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export const AuthDebugger: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  const testSessionDirectly = async () => {
    setTesting(true);
    setLogs([]);
    
    try {
      addLog('🔄 Testing getSession directly...');
      
      const startTime = Date.now();
      const { data, error } = await supabase.auth.getSession();
      const endTime = Date.now();
      
      addLog(`⏱️ getSession took ${endTime - startTime}ms`);
      
      if (error) {
        addLog(`❌ getSession error: ${error.message}`);
      } else {
        addLog(`✅ getSession success: ${data.session ? 'Session found' : 'No session'}`);
        if (data.session) {
          addLog(`👤 User ID: ${data.session.user.id}`);
          addLog(`⏰ Expires at: ${data.session.expires_at ? new Date(data.session.expires_at * 1000).toLocaleString() : 'N/A'}`);
        }
      }
    } catch (err) {
      addLog(`💥 getSession threw error: ${err}`);
    } finally {
      setTesting(false);
    }
  };

  const testWithTimeout = async () => {
    setTesting(true);
    setLogs([]);
    
    try {
      addLog('🔄 Testing getSession with 3s timeout...');
      
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('3s timeout')), 3000)
      );
      
      const result = await Promise.race([sessionPromise, timeoutPromise]);
      addLog('✅ getSession completed within 3s');
      addLog(`📦 Result: ${JSON.stringify(result, null, 2)}`);
      
    } catch (err) {
      addLog(`❌ getSession timed out or failed: ${err}`);
    } finally {
      setTesting(false);
    }
  };

  const clearAuth = async () => {
    addLog('🧹 Clearing auth...');
    await supabase.auth.signOut();
    addLog('✅ Auth cleared');
  };

  return (
    <div className="fixed top-4 right-4 w-96 bg-white p-4 border rounded shadow-lg z-50 max-h-96 overflow-y-auto">
      <h3 className="font-bold mb-2">Auth Debugger</h3>
      
      <div className="space-y-2 mb-4">
        <button 
          onClick={testSessionDirectly}
          disabled={testing}
          className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
        >
          Test getSession
        </button>
        
        <button 
          onClick={testWithTimeout}
          disabled={testing}
          className="bg-orange-500 text-white px-3 py-1 rounded text-sm"
        >
          Test with 3s timeout
        </button>
        
        <button 
          onClick={clearAuth}
          disabled={testing}
          className="bg-red-500 text-white px-3 py-1 rounded text-sm"
        >
          Clear Auth
        </button>
      </div>
      
      <div className="text-xs bg-gray-100 p-2 rounded max-h-40 overflow-y-auto">
        {logs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>
    </div>
  );
};
