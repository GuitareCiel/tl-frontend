// lib/api.ts
import { 
    PledgeList, 
    RequestList, 
    AccountResponse, 
    PledgeChallenge, 
    ApprovalRequest, 
    ApprovalResponse 
  } from '@/types';
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  
  // Helper function for API requests
  async function fetchApi<T>(
    endpoint: string, 
    options?: RequestInit
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Set default headers
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options?.headers || {}),
    };
    
    try {
      console.log(`Fetching API: ${url}`);
      const response = await fetch(url, {
        ...options,
        headers,
        // Include credentials if your API uses cookies
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      // Add more detailed error information
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error(`Network error: Could not connect to ${endpoint}. Please check your API server is running.`);
      }
      throw error;
    }
  }
  
  // Authenticate and get token
  export async function authenticate(apiUser?: string, apiKey?: string): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/authenticate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key_id: apiUser || process.env.NEXT_PUBLIC_API_USER,
          api_key_secret: apiKey || process.env.NEXT_PUBLIC_API_KEY,
        }),
      });
      
      const data = await response.json();
      
      if (data.success && data.token) {
        // Store token in localStorage or another secure storage
        localStorage.setItem('auth_token', data.token);
        return { success: true, token: data.token };
      }
      
      return { success: false, error: data.error || 'Authentication failed' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Authentication failed' 
      };
    }
  }
  
  // Get all pledges
  export async function getAllPledges(): Promise<PledgeList> {
    return fetchApi<PledgeList>('/list-all-pledges');
  }
  
  // Get pending increment requests
  export async function getPendingRequests(params?: Record<string, string>): Promise<RequestList> {
    const queryString = params 
      ? '?' + new URLSearchParams(params).toString() 
      : '';
    
    return fetchApi<RequestList>(`/list-pending-requests${queryString}`, {
      method: 'GET',
    });
  }

  
  // Get account details
  export async function getAccount(accountId: string): Promise<AccountResponse> {
    return fetchApi<AccountResponse>(`/account/${accountId}`);
  }
  
  // Get pledge challenge
  export async function getPledgeChallenge(pledgeId: string): Promise<PledgeChallenge> {
    return fetchApi<PledgeChallenge>(`/get-pledge-challenge/${pledgeId}`);
  }
  
  // Approve pledge increment
  export async function approvePledge(
    pledgeId: string, 
    data: ApprovalRequest
  ): Promise<ApprovalResponse> {
    return fetchApi<ApprovalResponse>(`/approve-pledge/${pledgeId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  export async function createSettlement(data: any): Promise<any> {
    return fetchApi<any>('/create-settlement', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  export async function getPledgeById(pledgeId: string): Promise<any> {
    return fetchApi<any>(`/pledge/${pledgeId}`);
  }

  // Define proper interfaces for your API functions
  interface FeeEstimationPayload {
    data: {
      account_id: string;
      fees_strategy: {
        data: {
          speed: string;
        };
        type: string;
      };
      transaction_data: {
        account_name: string;
        amount: string;
        max_fees: string;
        recipient: string;
        currency: string;
      };
      transaction_type: string;
    };
    note: {
      content: string;
      title: string;
    };
    type: string;
  }

  export async function estimateTransactionFees(
    data: FeeEstimationPayload
  ): Promise<{
    success: boolean;
    fee_estimation?: {
      max_fees: string;
      [key: string]: unknown;
    };
    error?: string;
  }> {
    return fetchApi<{
      success: boolean;
      fee_estimation?: {
        max_fees: string;
        [key: string]: unknown;
      };
      error?: string;
    }>('/estimate-fees', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }