export interface IOSTAccountInfo {
  name: string;
  balance: string;
  gasInfo: {
    current_gas: string;
    gas_amount: string;
  };
  permissions: Record<string, unknown>;
  frozen_balance: string;
  frozen_gas: string;
  ram_info: {
    available: string;
    total: string;
  };
}

export interface IOSTBalanceResponse {
  status: string;
  result?: {
    balance: string;
    frozen_balances?: Array<{
      amount: string;
      time: number;
    }>;
  };
  message?: string;
}

export interface IOSTAccountResponse {
  status: string;
  result?: IOSTAccountInfo;
  message?: string;
}

export interface ParsedBalance {
  iost: number;
  gas: number;
  ram: number;
  staked: number;
  jpyEquivalent: number;
}
