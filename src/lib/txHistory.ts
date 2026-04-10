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
 * IOSTABC APIを使用してアカウントのトランザクション履歴を取得
 */
export async function fetchBlockchainTxHistory(
  accountId: string,
  limit = 20
): Promise<TxRecord[]> {
  try {
    const response = await fetch(
      `https://api.iostabc.com/api/Get-Account-Tx?name=${accountId}&limit=${limit}`
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return parseBlockchainTx(data, accountId);
  } catch {
    // フォールバック: 最新ブロックからトランザクションを取得
    return fetchFromLatestBlocks(accountId, limit);
  }
}

/**
 * IOSTABC APIのレスポンスをパース
 */
function parseBlockchainTx(data: unknown, accountId: string): TxRecord[] {
  if (!data || typeof data !== "object") return [];

  const txList = (data as Record<string, unknown>).data as
    | Array<Record<string, unknown>>
    | undefined;

  if (!txList || !Array.isArray(txList)) return [];

  return txList
    .map((tx) => {
      const txHash = (tx.hash as string) || (tx.tx_hash as string) || "";
      const timestamp = parseTimestamp(tx.time as string | number | undefined);
      const actions = (tx.actions as Array<Record<string, unknown>> | undefined) || [];

      // トランザクションの種類と数量を判定
      const { type, label, amount, counterparty } = analyzeActions(
        actions,
        accountId
      );

      const status: TxRecord["status"] =
        (tx.status as string) === "SUCCESS" || (tx.status as string) === "success"
          ? "success"
          : "failed";

      return {
        id: `chain_${txHash.slice(0, 16)}`,
        type,
        label,
        amount,
        counterparty,
        txHash,
        timestamp,
        status,
      };
    })
    .filter((tx) => tx.type !== undefined);
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

    // 送金 (iost.token_transfer / iost.transfer)
    if (
      contract === "token.iost" &&
      (func === "transfer" || func === "transferFreeze")
    ) {
      const from = dataArray[0] as string | undefined;
      const to = dataArray[1] as string | undefined;
      const amountStr = dataArray[2] as string | undefined;
      const amount = amountStr ? parseAmount(amountStr.split(" ")[0] || "0") : "0";

      if (from === accountId) {
        return {
          type: "send",
          label: "📤 送信",
          amount: `-${amount} IOST`,
          counterparty: to,
        };
      } else if (to === accountId) {
        return {
          type: "receive",
          label: "📥 受信",
          amount: `+${amount} IOST`,
          counterparty: from,
        };
      }
    }

    // Gasステーキング (gas.iost.pledge)
    if (contract === "gas.iost" && func === "pledge") {
      const amountStr = dataArray[2] as string | undefined;
      const amount = amountStr ? parseAmount(amountStr.split(" ")[0] || "0") : "0";
      return {
        type: "stake",
        label: "🌱 Gas取得",
        amount: `-${amount} IOST`,
      };
    }

    // Gasステーキング解除 (gas.iost.unpledge)
    if (contract === "gas.iost" && func === "unpledge") {
      const amountStr = dataArray[2] as string | undefined;
      const amount = amountStr ? parseAmount(amountStr.split(" ")[0] || "0") : "0";
      return {
        type: "unstake",
        label: "🔓 Gas解除",
        amount: `+${amount} IOST`,
      };
    }

    // 投票 (vote_producer.iost.vote)
    if (contract === "vote_producer.iost" && func === "vote") {
      const amountStr = dataArray[2] as string | undefined;
      const amount = amountStr ? parseAmount(amountStr.split(" ")[0] || "0") : "0";
      return {
        type: "vote",
        label: "🗳️ 投票",
        amount: `-${amount} IOST`,
        counterparty: dataArray[1] as string | undefined,
      };
    }

    // 投票解除 (vote_producer.iost.unvote)
    if (contract === "vote_producer.iost" && func === "unvote") {
      const amountStr = dataArray[2] as string | undefined;
      const amount = amountStr ? parseAmount(amountStr.split(" ")[0] || "0") : "0";
      return {
        type: "unvote",
        label: "❌ 投票解除",
        amount: `+${amount} IOST`,
        counterparty: dataArray[1] as string | undefined,
      };
    }

    // 報酬 (bonus iost)
    if (contract === "bonus.iost") {
      return {
        type: "reward",
        label: "🎁 報酬",
        amount: "+0 IOST",
      };
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
): {
  type: TxRecord["type"];
  label: string;
  amount: string;
  counterparty?: string;
} {
  for (const action of actions) {
    const result = analyzeAction(action as Record<string, unknown>, accountId);
    if (result) return result;
  }

  // 不明なトランザクション
  return {
    type: "send",
    label: "📋 トランザクション",
    amount: "0 IOST",
  };
}

/**
 * タイムスタンプをパース（秒またはミリ秒）
 */
function parseTimestamp(ts: string | number | undefined): string {
  if (!ts) return new Date().toISOString();
  const num = typeof ts === "string" ? parseInt(ts, 10) : ts;
  // 秒単位の場合（10桁）はミリ秒に変換
  const millis = num < 1e12 ? num * 1000 : num;
  return new Date(millis).toISOString();
}

/**
 * フォールバック: 最新ブロックからトランザクションを取得
 * IOST公式ノードRPCを使用
 */
async function fetchFromLatestBlocks(
  accountId: string,
  limit: number
): Promise<TxRecord[]> {
  try {
    const nodeInfoRes = await fetch("https://api.iost.io/getChainInfo");
    if (!nodeInfoRes.ok) return [];
    const nodeInfo = await nodeInfoRes.json();
    const chainLength = (nodeInfo.chain_length as number) || 0;

    const records: TxRecord[] = [];
    // 最新20ブロックを走査
    const startBlock = Math.max(0, chainLength - 20);

    for (let i = chainLength - 1; i >= startBlock && records.length < limit; i--) {
      try {
        const blockRes = await fetch(`https://api.iost.io/getBlockByNumber/${i}/true`);
        if (!blockRes.ok) continue;
        const block = await blockRes.json();
        const txs = (block.transactions as Array<Record<string, unknown>> | undefined) || [];

        for (const tx of txs) {
          const publisher = (tx.publisher as string) || "";
          if (publisher !== accountId) continue;

          const actions = (tx.actions as Array<Record<string, unknown>> | undefined) || [];
          const { type, label, amount, counterparty } = analyzeActions(
            actions,
            accountId
          );
          const time = (tx.time as number) || 0;
          const hash = (tx.hash as string) || (tx.txHash as string) || "";

          records.push({
            id: `chain_${hash.slice(0, 16)}`,
            type,
            label,
            amount,
            counterparty,
            txHash: hash,
            timestamp: new Date(time).toISOString(),
            status: "success",
          });
        }
      } catch {
        // ブロック取得失敗は無視
      }
    }

    return records;
  } catch {
    return [];
  }
}
