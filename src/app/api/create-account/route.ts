import { NextRequest, NextResponse } from "next/server";
import { IOST, KeyPair, Account, Bs58, Algorithm } from "iost";

/**
 * IOSTアカウント作成 API Route
 *
 * スポンサーアカウント（aiyaa_cs）を使用して新規アカウントを作成する。
 * 秘密鍵はサーバーサイドでのみ処理され、クライアントには一切送信されない。
 *
 * フロー:
 * 1. 新規キーペア生成（Ed25519）
 * 2. アカウント名生成（chan_ + 5桁乱数）
 * 3. auth.iost.signUp トランザクション作成
 * 4. gas.iost.pledge（初期Gas: 1 IOST）
 * 5. ram.iost.buy（初期RAM: 1024 bytes）
 * 6. スポンサーアカウントで署名・送信
 * 7. 結果をクライアントに返却（新規秘密鍵も含む）
 */
export async function POST(req: NextRequest) {
  try {
    // 環境変数からスポンサー認証情報を取得
    const sponsorId = process.env.SPONSOR_ACCOUNT_ID;
    const sponsorSecretKey = process.env.SPONSOR_SECRET_KEY;

    if (!sponsorId || !sponsorSecretKey) {
      return NextResponse.json(
        { error: "サーバー設定エラー: スポンサー認証情報が不足しています" },
        { status: 500 }
      );
    }

    // IOST SDK初期化（メインネット）
    const iost = new IOST({
      host: "https://api.iost.io",
      gasRatio: 1,
      gasLimit: 1000000,
      expiration: 90,
      delay: 0,
    });

    // スポンサーアカウント設定
    const sponsorAccount = new Account(sponsorId);
    const sponsorKp = new KeyPair(Bs58.decode(sponsorSecretKey), Algorithm.Ed25519);
    sponsorAccount.addKeyPair(sponsorKp, "active");
    sponsorAccount.addKeyPair(sponsorKp, "owner");
    iost.setAccount(sponsorAccount);

    // 新規キーペア生成（Ed25519）
    const newKeyPair = KeyPair.newKeyPair(Algorithm.Ed25519);
    const newPublicKey = Bs58.encode(newKeyPair.pubkey);
    const newSecretKey = newKeyPair.B58SecKey();

    // アカウント名生成（chan_ + 5桁乱数）
    const randomSuffix = String(Math.floor(Math.random() * 100000)).padStart(5, "0");
    const newAccountId = `chan_${randomSuffix}`;

    // トランザクション作成
    const tx = iost.callABI("auth.iost", "signUp", [
      newAccountId,
      newPublicKey,
      newPublicKey, // ownerキーとアクティブキーに同じ公開鍵を使用
    ]);

    // 初期Gas設定（1 IOST プレッジ ≈ 30 IOST相当）
    iost.callABI("gas.iost", "pledge", [sponsorId, newAccountId, "1"], tx);

    // 初期RAM設定（1024 bytes ≈ 3.4 IOST相当）
    iost.callABI("ram.iost", "buy", [sponsorId, newAccountId, 1024], tx);

    // ノード情報取得で時刻同期
    const nodeInfo = await fetch("https://api.iost.io/getNodeInfo").then(
      (res) => res.json()
    );
    const serverTime = nodeInfo.server_time;
    (iost as unknown as Record<string, unknown>).serverTimeDiff =
      serverTime - Date.now() * 1000;

    // トランザクション送信
    const result = await sendTransaction(iost, tx);

    if (result.status === "success") {
      return NextResponse.json({
        accountId: newAccountId,
        publicKey: newPublicKey,
        secretKey: newSecretKey,
        txHash: result.txHash,
        status: "success",
      });
    } else {
      return NextResponse.json(
        {
          error: result.message || "アカウント作成に失敗しました",
          status: "failed",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Account creation error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "アカウント作成中にエラーが発生しました",
      },
      { status: 500 }
    );
  }
}

/**
 * トランザクションを送信し結果を返す
 */
async function sendTransaction(
  iost: IOST,
  tx: unknown
): Promise<{ txHash: string; status: "success" | "failed"; message?: string }> {
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

          if (
            lastMsg.status === "success" ||
            lastMsg.status === "irreversible"
          ) {
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
