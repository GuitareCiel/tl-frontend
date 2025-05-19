// components/settlement-modal.tsx
"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { createSettlement, getPledgeById, getAccount, estimateTransactionFees } from '@/lib/api'
import { v4 as uuidv4 } from 'uuid'
import { SettlementConfirmation } from '@/components/settlement-confirmation'

interface SettlementModalProps {
  isOpen: boolean
  onClose: () => void
}

interface SettlementData {
  id: string;
  from_pledge_id?: string;
  meta: Record<string, unknown>;
  outbound_transaction_intent?: {
    account_id: string;
    transaction_data: {
      amount: string;
      recipient: string;
      currency: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
  inbound_transaction_intent?: {
    [key: string]: any;
  };
  [key: string]: any;
}

export function SettlementModal({ isOpen, onClose }: SettlementModalProps) {
  // State for outbound settlement
  const [pledgeId, setPledgeId] = useState<string>('')
  const [outboundAmount, setOutboundAmount] = useState<string>('')
  const [recipientAddress, setRecipientAddress] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  
  // State for inbound settlement
  const [toAccount, setToAccount] = useState<string>('')
  const [toAddress, setToAddress] = useState<string>('')
  const [inboundAmount, setInboundAmount] = useState<string>('')
  
  // State for confirmation
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [confirmationType, setConfirmationType] = useState<'inbound' | 'outbound'>('outbound')
  const [settlementData, setSettlementData] = useState<SettlementData | null>(null)
  const [settlementId, setSettlementId] = useState<string>('')
  
  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      resetForm()
    }
  }, [isOpen])
  
  const resetForm = () => {
    setPledgeId('')
    setOutboundAmount('')
    setRecipientAddress('')
    setToAccount('')
    setToAddress('')
    setInboundAmount('')
    setIsSubmitting(false)
    setIsVerifying(false)
    setShowConfirmation(false)
    setSettlementData(null)
    setSettlementId('')
  }
  
  // Add this function to prepare the fee estimation payload
  const prepareFeeEstimationPayload = (
    accountId: string, 
    accountName: string, 
    amount: string, 
    recipient: string, 
    currency: string
  ) => {
    return {
        data: {
            account_id: accountId,
            fees_strategy: {
            data: {
                speed: "FAST"
            },
            type: "SPEED"
            },
            transaction_data: {
            account_name: accountName,
            amount: amount,
            max_fees:"0",
            recipient: recipient,
            currency: currency
    },
        transaction_type: "ETHEREUM_LIKE_SEND"
        },
        note: {
            content: "null",
          title: "null"
      },
      type: "CREATE_TRANSACTION"
    };
};
  
  // Update the prepareOutboundSettlement function
  const prepareOutboundSettlement = async () => {
    if (!pledgeId || !outboundAmount || !recipientAddress) {
      toast.error('Please fill in all required fields')
      return
    }
    
    setIsVerifying(true)
    
    try {
      // Fetch pledge details to get account ID
      const pledgeResponse = await getPledgeById(pledgeId)
      
      if (!pledgeResponse.success) {
        toast.error('Failed to verify pledge details', {
          description: pledgeResponse.error || 'Pledge not found'
        })
        setIsVerifying(false)
        return
      }
      
      const pledge = pledgeResponse.pledge
      const accountId = pledge.account_id
      
      // Fetch account details to get account name
      const accountResponse = await getAccount(accountId)
      
      if (!accountResponse.success) {
        toast.error('Failed to fetch account details', {
          description: accountResponse.error || 'Account not found'
        })
        setIsVerifying(false)
        return
      }
      
      const accountName = accountResponse.account.name || `Account ${accountId}`
      
      // Create a unique ID for the settlement
      const newSettlementId = uuidv4()
      setSettlementId(newSettlementId)
      
      // Convert amount to Wei (assuming input is in ETH)
      // 1 ETH = 10^18 Wei
      const amountInWei = String(parseFloat(outboundAmount) * 1e18)
      
      // Estimate transaction fees
      const feeEstimationPayload = prepareFeeEstimationPayload(
        accountId,
        accountName,
        amountInWei,
        recipientAddress,
        pledge.currency || "ethereum"
      )
      console.log("feeEstimationPayload");
      console.log(feeEstimationPayload);
      const feeEstimation = await estimateTransactionFees(feeEstimationPayload)
      
      if (!feeEstimation.success) {
        toast.error('Failed to estimate transaction fees', {
          description: feeEstimation.error || 'Unknown error'
        })
        setIsVerifying(false)
        return
      }
      console.log(feeEstimation);
      
      const maxFees = feeEstimation.fee_estimation?.max_fees || "0"
      
      // Prepare settlement data with the correct nested structure
      const settlementPayload = {
        from_pledge_id: pledgeId,
        id: newSettlementId,
        meta: {},
        outbound_transaction_intent: {
          account_id: accountId,
          fees_strategy: {
            data: {
              speed: "FAST"
            },
            type: "SPEED"
          },
          transaction_data: {
            account_name: accountName,
            amount: amountInWei,
            currency: pledge.currency || "ethereum",
            max_fees: maxFees,
            recipient: recipientAddress
          },
          transaction_type: "ETHEREUM_LIKE_SEND"
        }
      }
      console.log("settlementPayload");
      console.log(settlementPayload);
      setSettlementData(settlementPayload)
      setConfirmationType('outbound')
      setShowConfirmation(true)
    } catch (error) {
      console.error('Error preparing settlement:', error)
      toast.error('Failed to prepare settlement', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsVerifying(false)
    }
  }
  
  // Similarly update the prepareInboundSettlement function
  const prepareInboundSettlement = async () => {
    if (!pledgeId || !toAccount || !toAddress || !inboundAmount) {
      toast.error('Please fill in all required fields')
      return
    }
    
    setIsVerifying(true)
    
    try {
      // Fetch pledge details to verify it exists
      const pledgeResponse = await getPledgeById(pledgeId)
      
      if (!pledgeResponse.success) {
        toast.error('Failed to verify pledge details', {
          description: pledgeResponse.error || 'Pledge not found'
        })
        setIsVerifying(false)
        return
      }
      
      // Fetch account details to get account name
      const accountResponse = await getAccount(toAccount)
      
      if (!accountResponse.success) {
        toast.error('Failed to fetch account details', {
          description: accountResponse.error || 'Account not found'
        })
        setIsVerifying(false)
        return
      }
      
      const accountName = accountResponse.account.name || `Account ${toAccount}`
      
      // Create a unique ID for the settlement
      const newSettlementId = uuidv4()
      setSettlementId(newSettlementId)
      
      // Convert amount to Wei (assuming input is in ETH)
      const amountInWei = String(parseFloat(inboundAmount) * 1e18)
      
      // Estimate transaction fees
      const feeEstimationPayload = prepareFeeEstimationPayload(
        toAccount,
        accountName,
        amountInWei,
        toAddress,
        pledgeResponse.pledge.currency || "ethereum_holesky"
      )
      
      const feeEstimation = await estimateTransactionFees(feeEstimationPayload)
      
      if (!feeEstimation.success) {
        toast.error('Failed to estimate transaction fees', {
          description: feeEstimation.error || 'Unknown error'
        })
        setIsVerifying(false)
        return
      }
      
      const maxFees = feeEstimation.fee_estimation?.max_fees || "0"
      
      // Prepare settlement data with the correct structure
      const settlementPayload = {
        id: newSettlementId,
        from_pledge_id: pledgeId,
        to_account_id: toAccount,
        meta: {},
        inbound_transaction_intent: {
          account_id: toAccount,
          transaction_data: {
            account_name: accountName,
            amount: amountInWei,
            currency: pledgeResponse.pledge.currency || "ethereum_holesky",
            max_fees: maxFees,
            recipient: toAddress
          },
          transaction_type: "ETHEREUM_LIKE_SEND"
        }
      }
      
      setSettlementData(settlementPayload)
      setConfirmationType('inbound')
      setShowConfirmation(true)
    } catch (error) {
      console.error('Error preparing settlement:', error)
      toast.error('Failed to prepare settlement', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsVerifying(false)
    }
  }
  
  const handleCreateSettlement = async () => {
    if (!settlementData) {
      toast.error('No settlement data available')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const response = await createSettlement(settlementData)
      
      if (response.success) {
        toast.success('Settlement created successfully', {
          description: `Settlement ID: ${settlementId}`
        })
        onClose()
      } else {
        toast.error('Failed to create settlement', {
          description: response.error || 'Unknown error'
        })
      }
    } catch (error) {
      console.error('Error creating settlement:', error)
      
      // Check if the error is related to JSON parsing
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      if (errorMessage.includes('Unexpected token')) {
        toast.error('Server returned an invalid response', {
          description: 'The server might be experiencing issues. Please try again later.'
        })
      } else {
        toast.error('Failed to create settlement', {
          description: errorMessage
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        {!showConfirmation ? (
          <>
            <DialogHeader>
              <DialogTitle>Create Settlement</DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="outbound" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="outbound">Outbound</TabsTrigger>
                <TabsTrigger value="inbound">Inbound</TabsTrigger>
              </TabsList>
              
              <TabsContent value="outbound" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="pledgeId">Pledge ID</Label>
                  <Input
                    id="pledgeId"
                    placeholder="Enter pledge ID"
                    value={pledgeId}
                    onChange={(e) => setPledgeId(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="recipientAddress">Recipient Address</Label>
                  <Input
                    id="recipientAddress"
                    placeholder="Enter recipient address"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="outboundAmount">Amount (ETH)</Label>
                  <Input
                    id="outboundAmount"
                    type="number"
                    placeholder="Enter amount in ETH"
                    value={outboundAmount}
                    onChange={(e) => setOutboundAmount(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Amount will be converted to Wei (1 ETH = 10^18 Wei)
                  </p>
                </div>
                
                <Button 
                  className="w-full mt-4" 
                  onClick={prepareOutboundSettlement}
                  disabled={isVerifying}
                >
                  {isVerifying ? 'Verifying Settlement Request...' : 'Create Settlement Request'}
                </Button>
              </TabsContent>
              
              <TabsContent value="inbound" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="inboundPledgeId">Pledge ID</Label>
                  <Input
                    id="inboundPledgeId"
                    placeholder="Enter pledge ID"
                    value={pledgeId}
                    onChange={(e) => setPledgeId(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="toAccount">To Account ID</Label>
                  <Input
                    id="toAccount"
                    placeholder="Enter account ID"
                    value={toAccount}
                    onChange={(e) => setToAccount(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="toAddress">To Address</Label>
                  <Input
                    id="toAddress"
                    placeholder="Enter address"
                    value={toAddress}
                    onChange={(e) => setToAddress(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="inboundAmount">Amount (ETH)</Label>
                  <Input
                    id="inboundAmount"
                    type="number"
                    placeholder="Enter amount in ETH"
                    value={inboundAmount}
                    onChange={(e) => setInboundAmount(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Amount will be converted to Wei (1 ETH = 10^18 Wei)
                  </p>
                </div>
                
                <Button 
                  className="w-full mt-4" 
                  onClick={prepareInboundSettlement}
                  disabled={isVerifying}
                >
                  {isVerifying ? 'Verifying Pledge...' : 'Create Settlement Request'}
                </Button>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <SettlementConfirmation
            data={settlementData as SettlementData}
            type={confirmationType}
            onConfirm={handleCreateSettlement}
            onBack={() => setShowConfirmation(false)}
            isSubmitting={isSubmitting}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}