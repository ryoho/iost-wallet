declare module "iost" {
  interface HTTPProviderConfig {
    host?: string;
    timeout?: number;
  }

  class HTTPProvider {
    constructor(host: string, timeout?: number);
    send(method: string, url: string, data?: unknown): Promise<unknown>;
  }

  class RPC {
    constructor(provider: HTTPProvider);
    setProvider(provider: HTTPProvider): void;
    getProvider(): HTTPProvider;
    blockchain: Blockchain;
    net: Net;
    transaction: unknown;
  }

  class Net {
    constructor(rpc: RPC);
    getNodeInfo(): Promise<{ server_time: number }>;
  }

  class Blockchain {
    constructor(rpc: RPC);
    getChainInfo(): Promise<unknown>;
    getBlockByHash(hash: string, complete: boolean): Promise<unknown>;
    getBlockByNum(num: number, complete: boolean): Promise<unknown>;
    getBalance(
      address: string,
      tokenSymbol?: string,
      useLongestChain?: number
    ): Promise<unknown>;
    getAccountInfo(id: string, reversible?: boolean): Promise<unknown>;
    getContract(id: string, useLongestChain?: number): Promise<unknown>;
    getGasRatio(): Promise<unknown>;
  }

  interface IOSTConfig {
    host?: string;
    timeout?: number;
    gasRatio?: number;
    gasLimit?: number;
    expiration?: number;
    delay?: number;
  }

  class IOST {
    constructor(config?: IOSTConfig);
    serverTimeDiff: number;
    signTx(
      tx: unknown,
      keyPairs: unknown[]
    ): Promise<unknown>;
    createTx(
      contractName: string,
      actionName: string,
      data: unknown[],
      initiator: string,
      delayUntil: number
    ): unknown;
    setAccount(account: Account): void;
    setRPC(rpc: RPC): Promise<void>;
    transfer(
      token: string,
      from: string,
      to: string,
      amount: string,
      memo?: string
    ): unknown;
    callABI(contract: string, abi: string, ...args: unknown[]): unknown;
    signAndSend(tx: unknown): unknown;
  }

  class KeyPair {
    constructor(secretKey: Uint8Array, algType?: number);
    pubkey: Uint8Array;
    secretKey: Uint8Array;
    id: string;
    B58SecKey(): string;
    B58PubKey(): string;
    static newKeyPair(algType?: number): KeyPair;
  }

  class Account {
    constructor(name: string, keyPair?: KeyPair);
    name: string;
    keyPair: KeyPair;
    addKeyPair(kp: KeyPair, permission: string): void;
  }

  class Tx {
    static from(
      tx: string | Record<string, unknown>,
      signer: string,
      keyPairs: KeyPair[]
    ): Promise<unknown>;
  }

  class Signature {
    sign(data: string, keyPair: KeyPair): Signature;
    verify(data: string, publicKey: string): boolean;
  }

  const Algorithm: {
    Ed25519: number;
    Secp256k1: number;
  };

  const Bs58: {
    encode(data: Uint8Array): string;
    decode(str: string): Uint8Array;
  };

  export {
    IOST,
    RPC,
    HTTPProvider,
    KeyPair,
    Account,
    Tx,
    Signature,
    Algorithm,
    Bs58,
  };
}
