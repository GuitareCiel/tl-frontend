// components/pending-increments.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ApprovalModal } from '@/components/approval-modal';
import { getPendingRequests, getPledgeChallenge } from '@/lib/api';
import { RequestList, DecodedChallenge, Request } from '@/types';
import { formatDate } from '@/lib/utils';

export function PendingIncrements({ onRefresh }: { onRefresh: () => void }) {
  // State for pledge requests
  const [isLoadingPledges, setIsLoadingPledges] = useState(true);
  const [pendingPledgeRequests, setPendingPledgeRequests] = useState<RequestList | null>(null);
  const [pledgeError, setPledgeError] = useState<string | null>(null);
  
  // State for settlement requests
  const [isLoadingSettlements, setIsLoadingSettlements] = useState(true);
  const [pendingSettlementRequests, setPendingSettlementRequests] = useState<RequestList | null>(null);
  const [settlementError, setSettlementError] = useState<string | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPledgeId, setSelectedPledgeId] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState('');
  const [challenge, setChallenge] = useState<DecodedChallenge | null>(null);
  const [isLoadingChallenge, setIsLoadingChallenge] = useState(false);
  const [selectedRequestType, setSelectedRequestType] = useState<'pledge' | 'settlement'>('pledge');

  const fetchPledgeRequests = async () => {
    setIsLoadingPledges(true);
    setPledgeError(null);
    
    try {
      const data = await getPendingRequests({ type: 'CREATE_PLEDGE_INCREMENT',status:"PENDING_APPROVAL" });
      console.log('Pending pledge requests data:', data);
      setPendingPledgeRequests(data);
    } catch (err) {
      setPledgeError(err instanceof Error ? err.message : 'Failed to fetch pending pledge requests');
      setPendingPledgeRequests(null);
    } finally {
      setIsLoadingPledges(false);
    }
  };

  const fetchSettlementRequests = async () => {
    setIsLoadingSettlements(true);
    setSettlementError(null);
    
    try {
      const data = await getPendingRequests({ 
        type: 'CREATE_TRANSACTION',
        status: 'PENDING_APPROVAL'
      });
      console.log('Pending settlement requests data:', data);
      setPendingSettlementRequests(data);
    } catch (err) {
      setSettlementError(err instanceof Error ? err.message : 'Failed to fetch pending settlement requests');
      setPendingSettlementRequests(null);
    } finally {
      setIsLoadingSettlements(false);
    }
  };

  useEffect(() => {
    fetchPledgeRequests();
    fetchSettlementRequests();
  }, []);

  const handleOpenApprovalModal = async (pledgeId: string, requestId: string, type: 'pledge' | 'settlement') => {
    setSelectedPledgeId(pledgeId);
    setSelectedRequestId(requestId);
    setSelectedRequestType(type);
    setIsModalOpen(true);
    setChallenge(null);
    setIsLoadingChallenge(true);
    
    try {
      const challengeData = await getPledgeChallenge(pledgeId);
      console.log(challengeData);
      if (challengeData.success) {
        setChallenge(challengeData.challenge.decoded);
      } else {
        setPledgeError(challengeData.error || 'Failed to fetch challenge');
      }
    } catch (err) {
      setPledgeError(err instanceof Error ? err.message : 'Failed to fetch challenge');
    } finally {
      setIsLoadingChallenge(false);
    }
  };

  const handleApprovalComplete = () => {
    fetchPledgeRequests();
    fetchSettlementRequests();
    onRefresh();
  };

  // Process the pledge requests
  const pledgeRequests = pendingPledgeRequests?.requests?.map(item => {
    // Check if item is a RequestNode (has node property) or a Request
    return 'node' in item ? item.node : item;
  }) || [];

  // Process the settlement requests
  const settlementRequests = pendingSettlementRequests?.requests?.map(item => {
    // Check if item is a RequestNode (has node property) or a Request
    return 'node' in item ? item.node : item;
  }) || [];

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Pending Pledge Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingPledges ? (
            <div className="text-center py-4">Loading pending pledges...</div>
          ) : pledgeError ? (
            <div className="text-red-500 py-4">{pledgeError}</div>
          ) : !pendingPledgeRequests?.success || !pledgeRequests.length ? (
            <div className="text-center py-4">No pending pledge requests found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pledge ID</TableHead>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pledgeRequests.map((request: Request, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-sm">
                      {request.target_id || request.pledge_id || 'N/A'}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{request.id || 'N/A'}</TableCell>
                    <TableCell>{request.status || 'Unknown'}</TableCell>
                    <TableCell>
                      <Button 
                        onClick={() => handleOpenApprovalModal(
                          request.target_id || request.pledge_id || '', 
                          request.id,
                          'pledge'
                        )}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Approve
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pending Settlements Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Settlements</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingSettlements ? (
            <div className="text-center py-4">Loading pending settlements...</div>
          ) : settlementError ? (
            <div className="text-red-500 py-4">{settlementError}</div>
          ) : !pendingSettlementRequests?.success || !settlementRequests.length ? (
            <div className="text-center py-4">No pending settlements found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created On</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settlementRequests.map((request: Request, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-sm">
                      {request.target_id || 'N/A'}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{request.id || 'N/A'}</TableCell>
                    <TableCell>{request.status || 'Unknown'}</TableCell>
                    <TableCell>{request.created_on ? formatDate(request.created_on) : 'N/A'}</TableCell>
                    <TableCell>
                      <Button 
                        onClick={() => handleOpenApprovalModal(
                          request.target_id || '', 
                          request.id,
                          'settlement'
                        )}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Approve
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ApprovalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        pledgeId={selectedPledgeId}
        requestId={selectedRequestId}
        challenge={challenge}
        isLoadingChallenge={isLoadingChallenge}
        onApprovalComplete={handleApprovalComplete}
        type={selectedRequestType}
      />
    </>
  );
}