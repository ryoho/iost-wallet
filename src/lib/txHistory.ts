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

function getRecords(): TxRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveRecords(records: TxRecord[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function addTxRecord(record: Omit<TxRecord, "id" | "timestamp">): void {
  const records = getRecords();
  const newRecord: TxRecord = {
    ...record,
    id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
  };
  records.unshift(newRecord);
  // 最大100件に制限
  if (records.length > 100) records.pop();
  saveRecords(records);
}

export function getTxRecords(): TxRecord[] {
  return getRecords();
}

export function updateTxStatus(
  txHash: string,
  status: "success" | "failed",
  message?: string
): void {
  const records = getRecords();
  const index = records.findIndex((r) => r.txHash === txHash);
  if (index !== -1) {
    records[index].status = status;
    if (message) records[index].message = message;
    saveRecords(records);
  }
}

export function clearTxRecords(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}
