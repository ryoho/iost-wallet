import { IOST, RPC, HTTPProvider } from "iost";

// メインネットRPCノード
const MAINNET_NODE = "https://api.iost.io";

const provider = new HTTPProvider(MAINNET_NODE);
export const rpc = new RPC(provider);

/**
 * IOSTインスタンスを取得（トランザクション署名用）
 */
export function getIostInstance(): IOST {
  return new IOST({
    host: MAINNET_NODE,
  });
}

/**
 * アカウント情報を取得
 */
export async function getAccountInfo(accountId: string) {
  return rpc.blockchain.getAccountInfo(accountId, false);
}

/**
 * IOST残高を取得
 */
export async function getIOSTBalance(accountId: string) {
  return rpc.blockchain.getBalance(accountId, "iost", 0);
}
