// app/settings/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Toaster, toast } from 'sonner';
import { authenticate } from '@/lib/api';
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Settings() {
  const [apiUser, setApiUser] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Load saved credentials on mount
  useEffect(() => {
    const savedApiUser = localStorage.getItem('api_user') || '';
    const savedApiSecret = localStorage.getItem('api_secret') || '';
    
    setApiUser(savedApiUser);
    setApiSecret(savedApiSecret);
    setIsLoading(false);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setStatus('idle');
    
    try {
      // Test the credentials before saving
      const result = await authenticate(apiUser, apiSecret);
      
      if (result.success) {
        // Save credentials to localStorage
        localStorage.setItem('api_user', apiUser);
        localStorage.setItem('api_secret', apiSecret);
        
        setStatus('success');
        toast.success('API credentials saved', {
          description: 'Your API credentials have been verified and saved.',
        });
      } else {
        setStatus('error');
        toast.error('Authentication failed', {
          description: result.error || 'Please check your API credentials and try again.',
        });
      }
    } catch (error) {
      setStatus('error');
      toast.error('Error saving credentials', {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading settings...</div>;
  }

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure your API credentials for the Pledge Management System
        </p>
      </header>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>API Credentials</CardTitle>
          <CardDescription>
            Enter your API credentials to connect to the Pledge Management API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {status === 'success' && (
            <Alert variant="default" className="border-green-500 bg-green-50 text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                Your API credentials have been verified and saved.
              </AlertDescription>
            </Alert>
          )}
          
          {status === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to authenticate with the provided credentials.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="apiUser">API User</Label>
            <Input
              id="apiUser"
              value={apiUser}
              onChange={(e) => setApiUser(e.target.value)}
              placeholder="Enter your API user ID"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="apiSecret">API Secret</Label>
            <Input
              id="apiSecret"
              type="password"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              placeholder="Enter your API secret key"
            />
          </div>
          
          <Button 
            onClick={handleSave} 
            disabled={isSaving || !apiUser || !apiSecret}
            className="mt-2"
          >
            {isSaving ? 'Saving...' : 'Save Credentials'}
          </Button>
        </CardContent>
      </Card>
      
      <Toaster position="top-right" />
    </div>
  );
}