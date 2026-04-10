import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { encryptPrivateKey, decryptPrivateKey } from "@/lib/crypto";

export interface EncryptedKeystore {
  iostAccountName: string;
  salt: string;
  iv: string;
  ciphertext: string;
  pinHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface Wallet {
  id: string;
  iostAccountName: string;
  createdAt: string;
}

/**
 * PINの簡易ハッシュ（検証用）
 */
function hashPin(pin: string): string {
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return hash.toString(36);
}

/**
 * ウォレットを追加
 */
export async function addWallet(
  userId: string,
  iostAccountName: string,
  privateKey: string,
  pin: string
): Promise<string> {
  const encrypted = await encryptPrivateKey(privateKey, pin);
  const walletId = `wallet_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const data: EncryptedKeystore = {
    iostAccountName,
    salt: encrypted.salt,
    iv: encrypted.iv,
    ciphertext: encrypted.ciphertext,
    pinHash: hashPin(pin),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await setDoc(doc(db, "users", userId, "wallets", walletId), data);
  return walletId;
}

/**
 * ウォレット一覧を取得
 */
export async function getWallets(userId: string): Promise<Wallet[]> {
  const walletsRef = collection(db, "users", userId, "wallets");
  const q = query(walletsRef, orderBy("createdAt", "asc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((d) => ({
    id: d.id,
    iostAccountName: d.data().iostAccountName,
    createdAt: d.data().createdAt,
  }));
}

/**
 * 特定のウォレットの暗号化データを復号化
 */
export async function getDecryptedPrivateKey(
  userId: string,
  walletId: string,
  pin: string
): Promise<{ iostAccountName: string; privateKey: string } | null> {
  const snapshot = await getDoc(doc(db, "users", userId, "wallets", walletId));

  if (!snapshot.exists()) return null;

  const data = snapshot.data() as EncryptedKeystore;

  if (hashPin(pin) !== data.pinHash) return null;

  const privateKey = await decryptPrivateKey(
    { salt: data.salt, iv: data.iv, ciphertext: data.ciphertext },
    pin
  );

  return { iostAccountName: data.iostAccountName, privateKey };
}

/**
 * ウォレットを削除
 */
export async function deleteWallet(userId: string, walletId: string): Promise<void> {
  await deleteDoc(doc(db, "users", userId, "wallets", walletId));
}

/**
 * ユーザーがウォレットを1件も持たないか確認
 */
export async function hasNoWallets(userId: string): Promise<boolean> {
  const walletsRef = collection(db, "users", userId, "wallets");
  const snapshot = await getDocs(walletsRef);
  return snapshot.empty;
}

/**
 * 旧単一キーストアから新フォーマットへのマイグレーション
 */
export async function migrateSingleKeystore(userId: string): Promise<void> {
  const oldSnapshot = await getDoc(doc(db, "keystores", userId));
  if (!oldSnapshot.exists()) return;

  const data = oldSnapshot.data();
  await setDoc(doc(db, "users", userId, "wallets", "wallet_migrated"), {
    iostAccountName: data.iostAccountName,
    salt: data.salt,
    iv: data.iv,
    ciphertext: data.ciphertext,
    pinHash: "",
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}
