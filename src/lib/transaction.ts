import { IOST, RPC, HTTPProvider, KeyPair, Account, Bs58, Algorithm } from "iost";

const MAINNET_NODE = "https://api.iost.io";

export interface TransferParams {
  from: string;
  to: string;
  amount: string;
  memo?: string;
}

export interface StakeParams {
  from: string;
  to: string;
  amount: string;
}

export interface TxResult {
  txHash: string;
  status: "pending" | "success" | "failed";
  message?: string;
}

/**
 * IOSTインスタンスを作成（RPC接続付き）
 */
export function createIostInstance(): { iost: IOST; rpc: RPC } {
  const provider = new HTTPProvider(MAINNET_NODE);
  const rpc = new RPC(provider);
  const iost = new IOST({
    host: MAINNET_NODE,
    gasRatio: 1,
    gasLimit: 2000000,
    expiration: 90,
    delay: 0,
  });

  return { iost, rpc };
}

/**
 * 送金トランザクションを作成して送信
 */
export async function sendTransfer(
  accountId: string,
  privateKey: string,
  params: TransferParams
): Promise<TxResult> {
  const { iost, rpc } = createIostInstance();

  // ノード情報取得で時刻同期
  const nodeInfo = await rpc.net.getNodeInfo();
  const serverTime = nodeInfo.server_time;
  (iost as unknown as Record<string, unknown>).serverTimeDiff = serverTime - Date.now() * 1000;

  // アカウント設定
  const keyPair = new KeyPair(Bs58.decode(privateKey), Algorithm.Ed25519);
  const account = new Account(accountId);
  account.addKeyPair(keyPair, "active");
  account.addKeyPair(keyPair, "owner");
  iost.setAccount(account);
  await iost.setRPC(rpc);

  // トランザクション送信
  const tx = iost.transfer(
    "iost",
    params.from,
    params.to,
    params.amount,
    params.memo || ""
  );

  return new Promise((resolve, reject) => {
    try {
      const callback = iost.signAndSend(tx);

      // コールバックで結果受信
      const checkResult = setInterval(() => {
        const msgs = (callback as Record<string, unknown>)._msgs as
          | Array<{ status: string; msg: string; hash: string }>
          | undefined;

        if (msgs && msgs.length > 0) {
          clearInterval(checkResult);
          const lastMsg = msgs[msgs.length - 1];

          if (lastMsg.status === "success" || lastMsg.status === "irreversible") {
            resolve({
              txHash: lastMsg.hash,
              status: "success",
            });
          } else if (lastMsg.status === "failed") {
            resolve({
              txHash: lastMsg.hash || "",
              status: "failed",
              message: lastMsg.msg,
            });
          }
        }
      }, 1000);

      // タイムアウト（30秒）
      setTimeout(() => {
        clearInterval(checkResult);
        resolve({
          txHash: "",
          status: "failed",
          message: "Transaction timeout",
        });
      }, 30000);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Gas取得（ステーキング）トランザクション
 */
export async function stakeForGas(
  accountId: string,
  privateKey: string,
  amount: string
): Promise<TxResult> {
  const { iost, rpc } = createIostInstance();

  const nodeInfo = await rpc.net.getNodeInfo();
  const serverTime = nodeInfo.server_time;
  (iost as unknown as Record<string, unknown>).serverTimeDiff = serverTime - Date.now() * 1000;

  const keyPair = new KeyPair(Bs58.decode(privateKey), Algorithm.Ed25519);
  const account = new Account(accountId);
  account.addKeyPair(keyPair, "active");
  account.addKeyPair(keyPair, "owner");
  iost.setAccount(account);
  await iost.setRPC(rpc);

  const tx = iost.callABI("gas.iost", "pledge", [
    accountId,
    accountId,
    amount,
  ]);

  return sendCustomTx(iost, tx);
}

/**
 * ステーキング解除（Gas返却）
 */
export async function unstakeGas(
  accountId: string,
  privateKey: string,
  amount: string
): Promise<TxResult> {
  const { iost, rpc } = createIostInstance();

  const nodeInfo = await rpc.net.getNodeInfo();
  const serverTime = nodeInfo.server_time;
  (iost as unknown as Record<string, unknown>).serverTimeDiff = serverTime - Date.now() * 1000;

  const keyPair = new KeyPair(Bs58.decode(privateKey), Algorithm.Ed25519);
  const account = new Account(accountId);
  account.addKeyPair(keyPair, "active");
  account.addKeyPair(keyPair, "owner");
  iost.setAccount(account);
  await iost.setRPC(rpc);

  const tx = iost.callABI("gas.iost", "unpledge", [
    accountId,
    accountId,
    amount,
  ]);

  return sendCustomTx(iost, tx);
}

/**
 * ノード投票トランザクション
 */
export async function voteProducer(
  accountId: string,
  privateKey: string,
  producer: string,
  amount: string
): Promise<TxResult> {
  const { iost, rpc } = createIostInstance();

  const nodeInfo = await rpc.net.getNodeInfo();
  const serverTime = nodeInfo.server_time;
  (iost as unknown as Record<string, unknown>).serverTimeDiff = serverTime - Date.now() * 1000;

  const keyPair = new KeyPair(Bs58.decode(privateKey), Algorithm.Ed25519);
  const account = new Account(accountId);
  account.addKeyPair(keyPair, "active");
  account.addKeyPair(keyPair, "owner");
  iost.setAccount(account);
  await iost.setRPC(rpc);

  const tx = iost.callABI("vote_producer.iost", "vote", [
    accountId,
    producer,
    amount,
  ]);

  return sendCustomTx(iost, tx);
}

/**
 * 投票解除
 */
export async function unvoteProducer(
  accountId: string,
  privateKey: string,
  producer: string,
  amount: string
): Promise<TxResult> {
  const { iost, rpc } = createIostInstance();

  const nodeInfo = await rpc.net.getNodeInfo();
  const serverTime = nodeInfo.server_time;
  (iost as unknown as Record<string, unknown>).serverTimeDiff = serverTime - Date.now() * 1000;

  const keyPair = new KeyPair(Bs58.decode(privateKey), Algorithm.Ed25519);
  const account = new Account(accountId);
  account.addKeyPair(keyPair, "active");
  account.addKeyPair(keyPair, "owner");
  iost.setAccount(account);
  await iost.setRPC(rpc);

  const tx = iost.callABI("vote_producer.iost", "unvote", [
    accountId,
    producer,
    amount,
  ]);

  return sendCustomTx(iost, tx);
}

/**
 * カスタムトランザクション送信
 */
function sendCustomTx(iost: IOST, tx: unknown): Promise<TxResult> {
  return new Promise((resolve, reject) => {
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
            resolve({
              txHash: lastMsg.hash,
              status: "success",
            });
          } else if (lastMsg.status === "failed") {
            resolve({
              txHash: lastMsg.hash || "",
              status: "failed",
              message: lastMsg.msg,
            });
          }
        }
      }, 1000);

      setTimeout(() => {
        clearInterval(checkResult);
        resolve({
          txHash: "",
          status: "failed",
          message: "Transaction timeout",
        });
      }, 30000);
    } catch (error) {
      reject(error);
    }
  });
}
