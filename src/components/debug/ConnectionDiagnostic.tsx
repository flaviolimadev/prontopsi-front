import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

interface DiagnosticResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

export function ConnectionDiagnostic() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [running, setRunning] = useState(false);
  const { user } = useAuth();

  const addResult = (result: DiagnosticResult) => {
    setResults(prev => {
      const filtered = prev.filter(r => r.test !== result.test);
      return [...filtered, result];
    });
  };

  const runDiagnostics = async () => {
    setRunning(true);
    setResults([]);

    // Test 1: Basic HTTP connection
    addResult({ test: 'HTTP Connection', status: 'pending', message: 'Testing basic HTTP connectivity...' });
    try {
      const response = await fetch('https://xsftvlanumkvglpvgrkj.supabase.co/rest/v1/', {
        method: 'HEAD',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzZnR2bGFudW1rdmdscHZncmtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNzY5MTUsImV4cCI6MjA2Nzc1MjkxNX0.5rNB3um3nTb77T1mHl_HSRml4v7y-xgXx9k_i-UjJFs'
        }
      });
      addResult({ 
        test: 'HTTP Connection', 
        status: 'success', 
        message: `HTTP connection successful (${response.status})` 
      });
    } catch (error) {
      addResult({ 
        test: 'HTTP Connection', 
        status: 'error', 
        message: `HTTP connection failed: ${error}`,
        details: error
      });
    }

    // Test 2: Auth status
    addResult({ test: 'Authentication', status: 'pending', message: 'Checking authentication status...' });
    try {
      const { data: { user: authUser }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      addResult({ 
        test: 'Authentication', 
        status: authUser ? 'success' : 'error', 
        message: authUser ? `Authenticated as ${authUser.email}` : 'Not authenticated',
        details: { userId: authUser?.id, email: authUser?.email }
      });
    } catch (error) {
      addResult({ 
        test: 'Authentication', 
        status: 'error', 
        message: `Auth check failed: ${error}`,
        details: error
      });
    }

    // Test 3: Simple query
    addResult({ test: 'Database Query', status: 'pending', message: 'Testing simple database query...' });
    try {
      const { data, error } = await supabase.from('patients').select('id').limit(1);
      if (error) throw error;
      
      addResult({ 
        test: 'Database Query', 
        status: 'success', 
        message: `Query successful (${data?.length || 0} results)`,
        details: data
      });
    } catch (error) {
      addResult({ 
        test: 'Database Query', 
        status: 'error', 
        message: `Query failed: ${error}`,
        details: error
      });
    }

    // Test 4: RLS policies
    if (user) {
      addResult({ test: 'RLS Policies', status: 'pending', message: 'Testing Row Level Security policies...' });
      try {
        const { data, error } = await supabase
          .from('patients')
          .select('id, name')
          .eq('user_id', user.id)
          .limit(1);
        
        if (error) throw error;
        
        addResult({ 
          test: 'RLS Policies', 
          status: 'success', 
          message: `RLS policies working (${data?.length || 0} user records found)`,
          details: data
        });
      } catch (error) {
        addResult({ 
          test: 'RLS Policies', 
          status: 'error', 
          message: `RLS test failed: ${error}`,
          details: error
        });
      }
    }

    setRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div className="space-y-4 p-4 bg-muted rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Diagnóstico de Conexão</h3>
        <Button onClick={runDiagnostics} disabled={running} size="sm">
          {running ? 'Executando...' : 'Repetir Teste'}
        </Button>
      </div>
      
      <div className="space-y-2">
        {results.map((result) => (
          <Alert key={result.test} variant={result.status === 'error' ? 'destructive' : 'default'}>
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span className="font-medium">{result.test}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  result.status === 'success' ? 'bg-green-100 text-green-800' :
                  result.status === 'error' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {result.status.toUpperCase()}
                </span>
              </div>
              <div className="mt-1 text-sm">{result.message}</div>
              {result.details && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-muted-foreground">
                    Ver detalhes
                  </summary>
                  <pre className="mt-1 text-xs overflow-auto bg-background p-2 rounded">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </details>
              )}
            </AlertDescription>
          </Alert>
        ))}
      </div>
    </div>
  );
}