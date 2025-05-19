// components/pledge-table.tsx
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getAllPledges, getAccount } from '@/lib/api';
import { getStatusColor, formatCurrencyAmount } from '@/lib/utils';
import { PledgeList, AccountResponse } from '@/types';
import { PledgeTableSkeleton } from '@/components/pledge-table-skeleton';
import { CopyButton } from '@/components/copy-button';
import { Skeleton } from '@/components/ui/skeleton';

export function PledgeTable() {
  const [isLoading, setIsLoading] = useState(true);
  const [pledges, setPledges] = useState<PledgeList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accountCache, setAccountCache] = useState<Record<string, AccountResponse>>({});
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);

  const fetchPledges = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getAllPledges();
      setPledges(data);
      setIsLoading(false); // Set loading to false as soon as we have pledge data
      
      // Now fetch account data in the background
      if (data.success && data.pledges) {
        setIsLoadingAccounts(true);
        
        const accountPromises = data.pledges
          .filter(pledgeItem => {
            const pledge = pledgeItem.node;
            return pledge.account_id && !accountCache[pledge.account_id];
          })
          .map(async pledgeItem => {
            const pledge = pledgeItem.node;
            try {
              const accountData = await getAccount(pledge.account_id);
              return { id: pledge.account_id, data: accountData };
            } catch (err) {
              console.error(`Error fetching account ${pledge.account_id}:`, err);
              return { id: pledge.account_id, data: null };
            }
          });
        
        const accountResults = await Promise.all(accountPromises);
        
        // Use a function to update state based on previous state
        setAccountCache(prevCache => {
          const newCache = { ...prevCache };
          
          accountResults.forEach(result => {
            if (result.data) {
              newCache[result.id] = result.data;
            }
          });
          
          return newCache;
        });
        
        setIsLoadingAccounts(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pledges');
      setPledges(null);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPledges();
  }, [fetchPledges]);

  const getCurrency = (accountId: string): string => {
    if (accountCache[accountId]?.success) {
      return accountCache[accountId].account.currency || 'USDC';
    }
    return 'USDC'; // Default
  };

  const getAccountName = (accountId: string): string => {
    if (accountCache[accountId]?.success) {
      return accountCache[accountId].account.name || `Account ${accountId}`;
    }
    return `Account ${accountId}`; // Default
  };

  const isAccountLoaded = (accountId: string): boolean => {
    return accountCache[accountId] !== undefined;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Pledges</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <PledgeTableSkeleton />
        ) : error ? (
          <div className="text-red-500 py-4">{error}</div>
        ) : !pledges?.success || !pledges.pledges || pledges.pledges.length === 0 ? (
          <div className="text-center py-4">No pledges found.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pledge ID</TableHead>
                <TableHead>Account ID</TableHead>
                <TableHead>Account Name</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pledges.pledges.map((pledgeItem, index) => {
                const pledge = pledgeItem.node;
                const accountLoaded = isAccountLoaded(pledge.account_id);
                const currency = getCurrency(pledge.account_id);
                
                return (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-sm flex items-center">
                      {pledge.id || 'N/A'}
                      {pledge.id && <CopyButton value={pledge.id} className="ml-2" />}
                    </TableCell>
                    <TableCell>
                      {pledge.account_id || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {isLoadingAccounts && !accountLoaded ? (
                        <Skeleton className="h-5 w-24" />
                      ) : (
                        getAccountName(pledge.account_id)
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isLoadingAccounts && !accountLoaded ? (
                        <Skeleton className="h-5 w-16 ml-auto" />
                      ) : (
                        formatCurrencyAmount(pledge.amount || 0, currency)
                      )}
                    </TableCell>
                    <TableCell>
                      {isLoadingAccounts && !accountLoaded ? (
                        <Skeleton className="h-5 w-12" />
                      ) : (
                        currency
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={`${getStatusColor(pledge.state)} text-white`}
                      >
                        {pledge.state || 'Unknown'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}