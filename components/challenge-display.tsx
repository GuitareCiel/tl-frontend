// components/challenge-display.tsx
import { DecodedChallenge } from '@/types';
import { formatAmount, formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ChallengeDisplayProps {
  challenge: DecodedChallenge | null;
  isLoading: boolean;
}

export function ChallengeDisplay({ challenge, isLoading }: ChallengeDisplayProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Challenge Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="font-semibold">Type:</p>
              <Skeleton className="h-5 w-24 mt-1" />
            </div>
            <div>
              <p className="font-semibold">Antireplay:</p>
              <Skeleton className="h-5 w-full mt-1" />
            </div>
            <div>
              <p className="font-semibold">Data:</p>
              <ul className="space-y-2 mt-2">
                <li className="flex items-center">
                  <span className="font-medium mr-2">Account:</span>
                  <Skeleton className="h-5 w-32" />
                </li>
                <li className="flex items-center">
                  <span className="font-medium mr-2">Amount:</span>
                  <Skeleton className="h-5 w-24" />
                </li>
                <li className="flex items-center">
                  <span className="font-medium mr-2">Currency:</span>
                  <Skeleton className="h-5 w-16" />
                </li>
                <li className="flex items-center">
                  <span className="font-medium mr-2">Exchange:</span>
                  <Skeleton className="h-5 w-28" />
                </li>
                <li className="flex items-center">
                  <span className="font-medium mr-2">Timestamp:</span>
                  <Skeleton className="h-5 w-40" />
                </li>
                <li className="flex items-center">
                  <span className="font-medium mr-2">Total Pledge:</span>
                  <Skeleton className="h-5 w-24" />
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!challenge) {
    return <div className="p-4 text-center">No challenge data available</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Challenge Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="font-semibold">Type:</p>
            <p>{challenge.type}</p>
          </div>
          <div>
            <p className="font-semibold">Antireplay:</p>
            <p className="font-mono text-sm break-all">{challenge.antireplay}</p>
          </div>
          <div>
            <p className="font-semibold">Data:</p>
            <ul className="space-y-2 mt-2">
              <li><span className="font-medium">Account:</span> {challenge.data.account_name}</li>
              <li><span className="font-medium">Amount:</span> {formatAmount(challenge.data.amount)}</li>
              <li><span className="font-medium">Currency:</span> {challenge.data.currency}</li>
              <li><span className="font-medium">Exchange:</span> {challenge.data.exchange}</li>
              <li><span className="font-medium">Timestamp:</span> {formatDate(challenge.data.timestamp)}</li>
              <li><span className="font-medium">Total Pledge:</span> {formatAmount(challenge.data.total_pledge)}</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}