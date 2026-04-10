export interface TxRecord {
  id: string;
  type: "send" | "receive" | "stake" | "unstake" | "vote" | "unvote" | "reward";
  label: string;
  amount: string;
  counterparty?: string;
  txHash: string;
  timestamp: string;
  status: "pending" | "success" | "failed";
  message?: string;
}

const STORAGE_KEY = "iost_tx_history";

export function addTxRecord(record: Omit<TxRecord, "id" | "timestamp">): void {
  // TxHistory機能はペンディング中 - 将来のTxノードサーバー実装まで無効化
  void 0;
}

export function getTxRecords(): TxRecord[] {
  return [];
}

export function updateTxStatus(
  _txHash: string,
  _status: "success" | "failed",
  _message?: string
): void {
  void 0;
}

export function clearTxRecords(): void {
  void 0;
}

// TxHistory機能はペンディング中 - 将来のTxノードサーバー実装まで無効化
export async function fetchBlockchainTxHistory(
  _accountId: string,
  _limit = 20
): Promise<TxRecord[]> {
  return [];
}
