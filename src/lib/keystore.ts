// Re-export from useFirestore hook for backward compatibility
export {
  addWallet,
  getWallets,
  getDecryptedPrivateKey,
  deleteWallet,
  hasNoWallets,
  migrateSingleKeystore,
} from "@/hooks/useFirestore";
export type { EncryptedKeystore, Wallet } from "@/hooks/useFirestore";
