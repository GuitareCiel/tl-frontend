// components/approval-modal.tsx
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChallengeDisplay } from '@/components/challenge-display';
import { DecodedChallenge } from '@/types';
import { approvePledge } from '@/lib/api';

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  pledgeId: string;
  requestId: string;
  challenge: DecodedChallenge | null;
  isLoadingChallenge: boolean;
  onApprovalComplete: () => void;
  type?: 'pledge' | 'settlement'; // New prop to determine the type
}

export function ApprovalModal({
  isOpen,
  onClose,
  pledgeId,
  requestId,
  challenge,
  isLoadingChallenge,
  onApprovalComplete,
  type = 'pledge' // Default to 'pledge' for backward compatibility
}: ApprovalModalProps) {
  const [privateKey, setPrivateKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [textareaHeight, setTextareaHeight] = useState(160); // Default height (8 rows)

  // Determine title and button text based on type
  const modalTitle = type === 'settlement' ? 'Approve Settlement' : 'Approve Pledge Increment';
  const buttonText = type === 'settlement' ? 'Approve Settlement' : 'Approve Pledge Increment';
  const successMessage = type === 'settlement' 
    ? 'Settlement approved successfully!' 
    : 'Pledge increment approved successfully!';

  // Adjust textarea height based on content
  useEffect(() => {
    // Count the number of lines in the private key
    const lineCount = (privateKey.match(/\n/g) || []).length + 1;
    
    // Set a minimum height (8 rows) and adjust based on content
    // Each line is approximately 20px
    const calculatedHeight = Math.max(160, Math.min(400, lineCount * 20));
    setTextareaHeight(calculatedHeight);
  }, [privateKey]);

  const handleSubmit = async () => {
    if (!privateKey.trim()) {
      setResult({
        success: false,
        message: 'Please provide a private key in PEM format'
      });
      return;
    }

    setIsSubmitting(true);
    setResult(null);

    try {
      // Format the private key with \n characters
      let formattedKey = privateKey.trim().replace(/\r\n/g, '\n');
      
      // Replace all newlines with \\n for JSON transport
      formattedKey = formattedKey.replace(/\n/g, '\\n');
      
      // Ensure there's a \\n after BEGIN and before END if not already there
      if (!formattedKey.includes('-----BEGIN EC PRIVATE KEY-----\\n')) {
        formattedKey = formattedKey.replace('-----BEGIN EC PRIVATE KEY-----', '-----BEGIN EC PRIVATE KEY-----\\n');
      }
      
      if (!formattedKey.includes('\\n-----END EC PRIVATE KEY-----')) {
        formattedKey = formattedKey.replace('-----END EC PRIVATE KEY-----', '\\n-----END EC PRIVATE KEY-----');
      }

      const response = await approvePledge(pledgeId, { private_key: formattedKey });
      
      if (response.success) {
        setResult({
          success: true,
          message: `${successMessage} State: ${response.state || 'Updated'}`
        });
        
        // Notify parent to refresh data
        setTimeout(() => {
          onApprovalComplete();
          onClose();
        }, 2000);
      } else {
        setResult({
          success: false,
          message: `Error approving: ${response.error}`
        });
      }
    } catch (error) {
      // More specific error handling
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setResult({
          success: false,
          message: 'Network error: Please check your connection and try again'
        });
      } else if (error instanceof Error && error.message.includes('401')) {
        setResult({
          success: false,
          message: 'Authentication error: Your session may have expired'
        });
      } else {
        setResult({
          success: false,
          message: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <p className="font-medium text-right">ID:</p>
            <p className="col-span-3 font-mono">{pledgeId}</p>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <p className="font-medium text-right">Request ID:</p>
            <p className="col-span-3 font-mono">{requestId}</p>
          </div>
          
          <div className="my-4">
            <ChallengeDisplay challenge={challenge} isLoading={isLoadingChallenge} />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="privateKey" className="font-medium">
              Private Key (PEM format):
            </label>
            <div className="w-full">
              <Textarea
                id="privateKey"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder="Paste your private key here in PEM format:
-----BEGIN PRIVATE KEY-----
...
-----END PRIVATE KEY-----"
                style={{ 
                  height: `${textareaHeight}px`, 
                  resize: 'vertical',
                  maxWidth: '100%',
                  overflowX: 'hidden',
                  wordBreak: 'break-all',
                  whiteSpace: 'pre-wrap'
                }}
                className="font-mono w-full"
                wrap="hard"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              The private key must be in PEM format with all line breaks preserved.
            </p>
          </div>
          
          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? 'Processing...' : buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}