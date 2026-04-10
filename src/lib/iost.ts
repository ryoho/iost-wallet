// Re-export from useIOST hook for backward compatibility
export {
  getRPC,
  getIOST,
  fetchAccountInfo,
  fetchIOSTBalance,
  setupIOSTAccount,
  sendTransaction,
} from "@/hooks/useIOST";
export type { TxResult } from "@/hooks/useIOST";

// Legacy exports
export { getIOST as getIostInstance } from "@/hooks/useIOST";
export { getRPC as rpc } from "@/hooks/useIOST";
