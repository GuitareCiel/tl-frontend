// types/index.ts
export interface Pledge {
    id: string;
    account_id: string;
    account_name?: string;
    amount: string | number;
    state: string;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface PledgeNode {
    node: Pledge;
    cursor?: string;
  }
  
  export interface PledgeList {
    success: boolean;
    pledges: PledgeNode[];
    total_count?: number;
    page?: number;
    page_size?: number;
    has_next_page?: boolean;
    error?: string;
  }
  
  export interface Request {
    id: string;
    target_id: string;
    pledge_id?: string;
    target_type: string;
    status: string;
    created_on?: string;
  }
  
  export interface RequestNode {
    node: Request;
    cursor?: string;
  }
  
  export interface RequestList {
    success: boolean;
    requests: (RequestNode | Request)[];
    error?: string;
  }
  
  export interface Account {
    id: string;
    name: string;
    currency: string;
    balance?: number;
  }
  
  export interface AccountResponse {
    success: boolean;
    account: Account;
    error?: string;
  }
  
  export interface ChallengeData {
    account_name: string;
    amount: string;
    currency: string;
    exchange: string;
    timestamp: string;
    total_pledge: string;
  }
  
  export interface DecodedChallenge {
    type: string;
    antireplay: string;
    data: ChallengeData;
  }
  
  export interface PledgeChallenge {
    success: boolean;
    challenge: {
      decoded: DecodedChallenge;
      raw?: string;
    };
    error?: string;
  }
  
  export interface ApprovalRequest {
    private_key: string;
  }
  
  export interface ApprovalResponse {
    success: boolean;
    pledge_id?: string;
    request_id?: string;
    is_approved?: boolean;
    state?: string;
    error?: string;
  }