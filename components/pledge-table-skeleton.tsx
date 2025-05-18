// components/pledge-table-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function PledgeTableSkeleton() {
  // Create an array of 5 items to represent loading rows
  const loadingRows = Array(5).fill(null);
  
  return (
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
        {loadingRows.map((_, index) => (
          <TableRow key={index}>
            <TableCell className="flex items-center">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-5 ml-2 rounded-full" />
            </TableCell>
            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
            <TableCell><Skeleton className="h-5 w-12" /></TableCell>
            <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}