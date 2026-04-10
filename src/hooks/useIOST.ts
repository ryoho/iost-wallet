import { IOST, RPC, HTTPProvider, KeyPair, Account, Bs58, Algorithm } from "iost";

const MAINNET_NODE = "https://api.iost.io";

let cachedRpc: RPC | null = null;

/**
 * 共通のHTTPProviderとRPCインスタンスを返す（シングルトン）
 */
export function getRPC(): RPC {
  if (!cachedRpc) {
    cachedRpc = new RPC(new HTTPProvider(MAINNET_NODE));
  }
  return cachedRpc;
}

/**
 * IOSTインスタンスを取得（トランザクション署名用）
 */
export function getIOST(): IOST {
  const iost = new IOST({
    host: MAINNET_NODE,
    gasRatio: 1,
    gasLimit: 2000000,
    expiration: 90,
    delay: 0,
  });
  return iost;
}

/**
 * アカウント情報取得
 */
export async function fetchAccountInfo(accountId: string) {
  return getRPC().blockchain.getAccountInfo(accountId, false);
}

/**
 * IOST残高取得
 */
export async function fetchIOSTBalance(accountId: string) {
  return getRPC().blockchain.getBalance(accountId, "iost", 0);
}

/**
 * IOSTインスタンスにアカウントとRPCを設定
 */
export async function setupIOSTAccount(
  iost: IOST,
  accountId: string,
  privateKey: string
): Promise<void> {
  const rpc = getRPC();
  const nodeInfo = await rpc.net.getNodeInfo();
  const serverTime = nodeInfo.server_time;
  (iost as unknown as Record<string, unknown>).serverTimeDiff = serverTime - Date.now() * 1000;

  const keyPair = new KeyPair(Bs58.decode(privateKey), Algorithm.Ed25519);
  const account = new Account(accountId);
  account.addKeyPair(keyPair, "active");
  account.addKeyPair(keyPair, "owner");
  iost.setAccount(account);
  await iost.setRPC(rpc);
}

export interface TxResult {
  txHash: string;
  status: "pending" | "success" | "failed";
  message?: string;
}

/**
 * カスタムトランザクション送信
 */
export function sendTransaction(iost: IOST, tx: unknown): Promise<TxResult> {
  return new Promise((resolve) => {
    try {
      const callback = iost.signAndSend(tx);

      const checkResult = setInterval(() => {
        const msgs = (callback as Record<string, unknown>)._msgs as
          | Array<{ status: string; msg: string; hash: string }>
          | undefined;

        if (msgs && msgs.length > 0) {
          clearInterval(checkResult);
          const lastMsg = msgs[msgs.length - 1];

          if (lastMsg.status === "success" || lastMsg.status === "irreversible") {
            resolve({ txHash: lastMsg.hash, status: "success" });
          } else if (lastMsg.status === "failed") {
            resolve({ txHash: lastMsg.hash || "", status: "failed", message: lastMsg.msg });
          }
        }
      }, 1000);

      setTimeout(() => {
        clearInterval(checkResult);
        resolve({ txHash: "", status: "failed", message: "Transaction timeout" });
      }, 30000);
    } catch {
      resolve({ txHash: "", status: "failed", message: "Transaction error" });
    }
  });
}
