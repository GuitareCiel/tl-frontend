// components/settlement-confirmation.tsx
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

// Define a proper type for the data prop
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

interface SettlementConfirmationProps {
  data: SettlementData;
  onConfirm: () => void;
  onBack: () => void;
  type: 'inbound' | 'outbound';
  isSubmitting?: boolean;
}

export function SettlementConfirmation({ 
  data, 
  onConfirm, 
  onBack, 
  type,
  isSubmitting = false
}: SettlementConfirmationProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2" disabled={isSubmitting}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-medium">Create {type === 'inbound' ? 'Inbound' : 'Outbound'} Settlement</h3>
      </div>
      
      <div className="border rounded-md p-4 bg-muted/30">
        <h4 className="font-medium mb-2">Request Payload:</h4>
        <ScrollArea className="h-[300px]">
          <pre className="text-xs overflow-auto whitespace-pre-wrap break-all">
            {JSON.stringify(data, null, 2)}
          </pre>
        </ScrollArea>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
          Back
        </Button>
        <Button onClick={onConfirm} disabled={isSubmitting}>
          {isSubmitting ? 'Creating Settlement...' : 'Create Settlement'}
        </Button>
      </div>
    </div>
  )
}