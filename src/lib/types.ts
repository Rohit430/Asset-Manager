export type AssetType = 'Equity' | 'Gold' | 'Mutual Fund' | 'Real Estate' | 'Bond' | 'Other';
export type Country = 'India' | 'US';
export type TransactionType = 'Buy' | 'Sell';
export type LiquidAssetType = 'Cash' | 'FD';

export interface TaxSettings {
  india: {
    shortTermDays: number;
    shortTermTax: number;
    longTermTax: number;
  };
  us: {
    shortTermDays: number;
    shortTermTax: number;
    longTermTax: number;
  };
}

export interface FeeSettings {
  brokerFeePercent: number;
  categoryFees: Record<string, { feePercent: number; feeFlat: number }>;
}

export interface UserPreferences {
  taxSettings: TaxSettings;
  feeSettings: FeeSettings;
  categories: string[];
}

// Encrypted Payload Structure
export interface EncryptedData {
  iv: string;
  ciphertext: string;
}

export interface AssetData {
  name: string;
  ticker?: string;
  notes?: string;
}

export interface Asset {
  id: string;
  user_id: string;
  type: string; // Plain text for filtering
  country: Country; // Plain text for filtering
  data: AssetData; // Decrypted data
  updated_at: string;
  
  // Computed fields (Runtime only, not stored in DB)
  totalQuantity: number;
  totalCost: number;
  avgBuyPrice: number;
  realizedPL: number;
  fifoQueue: FifoBatch[];
}

export interface FifoBatch {
  qty: number;
  price: number;
  date: string;
}

export interface TransactionData {
  quantity: number;
  price: number; // Base currency (INR) price per unit
  originalPrice?: number; // Original currency price
  currency: string; // "INR", "USD", etc.
  exchangeRate: number; // Rate to INR on that date (1 if INR)
  miscCosts: number; // Fees in base currency
  notes?: string;
  
  // Sell-specific computed data (stored for record)
  profit?: number;
  taxAmount?: number;
  brokerFee?: number;
  netProfit?: number;
  holdingPeriod?: number; // Days
  termType?: 'Short Term' | 'Long Term';
  financialYear?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  asset_id: string;
  type: TransactionType;
  tx_date: string; // Plain text YYYY-MM-DD
  data: TransactionData; // Decrypted data
  updated_at: string;
}

export interface LiquidAssetData {
  bankName: string;
  amount: number; // Current value or Principal
  notes?: string;
  
  // FD Specific
  holderName?: string;
  startDate?: string;
  endDate?: string;
  interestRate?: number;
  maturityAmount?: number;
}

export interface LiquidAsset {
  id: string;
  user_id: string;
  type: LiquidAssetType;
  data: LiquidAssetData; // Decrypted
  updated_at: string;
}
