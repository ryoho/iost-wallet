import { getIOST, setupIOSTAccount, sendTransaction, type TxResult } from "@/hooks/useIOST";
import { IOST } from "iost";

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

export { type TxResult } from "@/hooks/useIOST";

/**
 * 送金トランザクションを作成して送信
 */
export async function sendTransfer(
  accountId: string,
  privateKey: string,
  params: TransferParams
): Promise<TxResult> {
  const iost = getIOST();
  await setupIOSTAccount(iost, accountId, privateKey);

  const tx = iost.transfer(
    "iost",
    params.from,
    params.to,
    params.amount,
    params.memo || ""
  );

  return sendTransaction(iost, tx);
}

/**
 * Gas取得（ステーキング）トランザクション
 */
export async function stakeForGas(
  accountId: string,
  privateKey: string,
  amount: string
): Promise<TxResult> {
  const iost = getIOST();
  await setupIOSTAccount(iost, accountId, privateKey);

  const tx = iost.callABI("gas.iost", "pledge", [accountId, accountId, amount]);
  return sendTransaction(iost, tx);
}

/**
 * ステーキング解除（Gas返却）
 */
export async function unstakeGas(
  accountId: string,
  privateKey: string,
  amount: string
): Promise<TxResult> {
  const iost = getIOST();
  await setupIOSTAccount(iost, accountId, privateKey);

  const tx = iost.callABI("gas.iost", "unpledge", [accountId, accountId, amount]);
  return sendTransaction(iost, tx);
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
  const iost = getIOST();
  await setupIOSTAccount(iost, accountId, privateKey);

  const tx = iost.callABI("vote_producer.iost", "vote", [accountId, producer, amount]);
  return sendTransaction(iost, tx);
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
  const iost = getIOST();
  await setupIOSTAccount(iost, accountId, privateKey);

  const tx = iost.callABI("vote_producer.iost", "unvote", [accountId, producer, amount]);
  return sendTransaction(iost, tx);
}

/**
 * RAM取得（RAMコインステーキング）トランザクション
 */
export async function stakeForRam(
  accountId: string,
  privateKey: string,
  amount: string
): Promise<TxResult> {
  const iost = getIOST();
  await setupIOSTAccount(iost, accountId, privateKey);

  const tx = iost.callABI("ramcoin.iost", "pledge", [accountId, amount]);
  return sendTransaction(iost, tx);
}

/**
 * RAMステーキング解除（RAMコイン返却）
 */
export async function unstakeRam(
  accountId: string,
  privateKey: string,
  amount: string
): Promise<TxResult> {
  const iost = getIOST();
  await setupIOSTAccount(iost, accountId, privateKey);

  const tx = iost.callABI("ramcoin.iost", "unpledge", [accountId, amount]);
  return sendTransaction(iost, tx);
}
