// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Combine class names with Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format large numbers with commas
export function formatAmount(amountStr: string | number): string {
  try {
    const amount = typeof amountStr === 'string' ? BigInt(amountStr) : BigInt(amountStr.toString());
    return amount.toLocaleString();
  } catch (e) {
    return String(amountStr);
  }
}

// Format date strings
export function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleString();
  } catch (error) {
    return dateString;
  }
}

// Get status badge color based on pledge state
export function getStatusColor(state: string): string {
  switch (state) {
    case 'PLEDGE_READY':
      return 'bg-green-500';
    case 'ASSIGNED':
    case 'ASSIGNED_TO_SETTLEMENT':
      return 'bg-blue-500';
    case 'PENDING':
    case 'PLEDGE_INCREMENT_PENDING_APPROVAL':
      return 'bg-yellow-500';
    default:
      return 'bg-red-500';
  }
}

export function formatCurrencyAmount(amount: string | number, currency: string): string {
  // Convert amount to a number if it's a string
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Handle different currencies
  switch (currency.toLowerCase()) {
    case 'ethereum':
    case 'ethereum_holesky':
      // Convert Wei to ETH (1 ETH = 10^18 Wei)
      return `${(numericAmount / 1e18).toFixed(6)} ETH`;
    
    // Add more currency conversions as needed
    // case 'bitcoin':
    //   return `${(numericAmount / 1e8).toFixed(8)} BTC`;
    
    // Default case for USDC and other currencies
    default:
      return formatAmount(numericAmount);
  }
}