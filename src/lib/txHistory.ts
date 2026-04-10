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

// ========== ブロックチェーンからのトランザクション取得 ==========

/**
 * IOST公式ノードから最新ブロックを走査してトランザクション履歴を取得
 * 並列リクエストで高速化
 */
export async function fetchBlockchainTxHistory(
  accountId: string,
  limit = 20
): Promise<TxRecord[]> {
  try {
    const chainInfoRes = await fetch("https://api.iost.io/getChainInfo");
    if (!chainInfoRes.ok) return [];

    const chainInfo = await chainInfoRes.json();
    const headBlock = (chainInfo.head_block as number) || 0;
    if (headBlock === 0) return [];

    const records: TxRecord[] = [];
    const scanCount = Math.min(100, headBlock);
    const startBlock = headBlock - scanCount;
    const batchSize = 5;

    for (let i = 0; i < scanCount && records.length < limit; i += batchSize) {
      const batch = [];
      for (let j = 0; j < batchSize && i + j < scanCount; j++) {
        const blockNum = startBlock + i + j;
        batch.push(fetchBlock(blockNum, accountId));
      }
      const results = await Promise.all(batch);
      for (const txs of results) {
        records.push(...txs);
        if (records.length >= limit) break;
      }
    }

    return records.slice(0, limit);
  } catch {
    return [];
  }
}

/**
 * 単一ブロックを取得して対象アカウントのトランザクションを抽出
 */
async function fetchBlock(blockNum: number, accountId: string): Promise<TxRecord[]> {
  try {
    const res = await fetch(`https://api.iost.io/getBlockByNumber/${blockNum}/true`);
    if (!res.ok) return [];

    const block = await res.json();
    const txs = (block.transactions as Array<Record<string, unknown>> | undefined) || [];
    const receipts: Array<Record<string, unknown>> =
      (block.receipts as Array<Record<string, unknown>> | undefined) || [];

    const records: TxRecord[] = [];

    for (let i = 0; i < txs.length; i++) {
      const tx = txs[i];
      const publisher = (tx.publisher as string) || "";
      if (publisher !== accountId) continue;

      const actions = (tx.actions as Array<Record<string, unknown>> | undefined) || [];
      const { type, label, amount, counterparty } = analyzeActions(actions, accountId);

      const receipt = receipts[i];
      const statusCode = receipt?.statusCode as number | undefined;
      const status: TxRecord["status"] = statusCode === 0 ? "success" : "failed";

      const txTime = (tx.time as number) || 0;
      const timestamp = new Date(txTime / 1e6).toISOString();

      const hash = (tx.hash as string) || (tx.txHash as string) || "";

      records.push({
        id: `chain_${hash.slice(0, 16)}`,
        type,
        label,
        amount,
        counterparty,
        txHash: hash,
        timestamp,
        status,
      });
    }

    return records;
  } catch {
    return [];
  }
}

/**
 * アクションリストを解析してトランザクションの種類を判定
 */
function analyzeAction(
  action: Record<string, unknown>,
  accountId: string
): {
  type: TxRecord["type"];
  label: string;
  amount: string;
  counterparty?: string;
} | null {
  const contract = (action.contract_name as string) || "";
  const func = (action.function_name as string) || "";
  const dataArray = (action.data as string[] | undefined) || [];

  try {
    const parseAmount = (raw: string): string => {
      const num = parseFloat(raw);
      return isNaN(num) ? "0" : num.toLocaleString("en-US", { maximumFractionDigits: 2 });
    };

    // 送金 (token.iost.transfer)
    if (
      contract === "token.iost" &&
      (func === "transfer" || func === "transferFreeze")
    ) {
      const from = dataArray[0] as string | undefined;
      const to = dataArray[1] as string | undefined;
      const amountStr = dataArray[2] as string | undefined;
      const amount = amountStr ? parseAmount(amountStr.split(" ")[0] || "0") : "0";

      if (from === accountId) {
        return { type: "send", label: "Send", amount: `-${amount} IOST`, counterparty: to };
      } else if (to === accountId) {
        return { type: "receive", label: "Receive", amount: `+${amount} IOST`, counterparty: from };
      }
    }

    // Gasステーキング (gas.iost.pledge)
    if (contract === "gas.iost" && func === "pledge") {
      const amountStr = dataArray[2] as string | undefined;
      const amount = amountStr ? parseAmount(amountStr.split(" ")[0] || "0") : "0";
      return { type: "stake", label: "Stake for Gas", amount: `-${amount} IOST` };
    }

    // Gasステーキング解除 (gas.iost.unpledge)
    if (contract === "gas.iost" && func === "unpledge") {
      const amountStr = dataArray[2] as string | undefined;
      const amount = amountStr ? parseAmount(amountStr.split(" ")[0] || "0") : "0";
      return { type: "unstake", label: "Unstake Gas", amount: `+${amount} IOST` };
    }

    // 投票 (vote_producer.iost.vote)
    if (contract === "vote_producer.iost" && func === "vote") {
      const amountStr = dataArray[2] as string | undefined;
      const amount = amountStr ? parseAmount(amountStr.split(" ")[0] || "0") : "0";
      return { type: "vote", label: "Vote Producer", amount: `-${amount} IOST`, counterparty: dataArray[1] as string | undefined };
    }

    // 投票解除 (vote_producer.iost.unvote)
    if (contract === "vote_producer.iost" && func === "unvote") {
      const amountStr = dataArray[2] as string | undefined;
      const amount = amountStr ? parseAmount(amountStr.split(" ")[0] || "0") : "0";
      return { type: "unvote", label: "Unvote Producer", amount: `+${amount} IOST`, counterparty: dataArray[1] as string | undefined };
    }

    // 報酬 (bonus.iost)
    if (contract === "bonus.iost") {
      return { type: "reward", label: "Reward", amount: "+0 IOST" };
    }
  } catch {
    // パース失敗
  }

  return null;
}

/**
 * アクションリストを解析して主要なトランザクションを抽出
 */
function analyzeActions(
  actions: Array<Record<string, unknown>>,
  accountId: string
): { type: TxRecord["type"]; label: string; amount: string; counterparty?: string } {
  for (const action of actions) {
    const result = analyzeAction(action as Record<string, unknown>, accountId);
    if (result) return result;
  }

  return { type: "send", label: "Transaction", amount: "0 IOST" };
}
