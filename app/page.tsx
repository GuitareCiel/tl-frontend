'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { PendingIncrements } from '@/components/pending-increments';
import { PledgeTable } from '@/components/pledge-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Dashboard() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast.success("Data refreshed", {
      description: "All pledge data has been refreshed.",
      duration: 3000,
    });
  };

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage your pledges and approval requests
        </p>
      </header>

      <Button 
        onClick={handleRefresh}
        className="mb-6"
      >
        Refresh All Data
      </Button>

      <div className="space-y-8">
        <PendingIncrements key={`pending-${refreshKey}`} onRefresh={handleRefresh} />
        <PledgeTable key={`pledges-${refreshKey}`} />
      </div>
    </div>
  );
}