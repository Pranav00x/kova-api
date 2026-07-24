import { db } from "./db.js";

export interface Wallet {
  id: string;
  user_id: string;
  smart_account_address: string;
  chain: string;
  created_at: string;
}

export async function getWalletForUser(userId: string): Promise<Wallet | null> {
  const result = await db.query<Wallet>("SELECT * FROM wallets WHERE user_id = $1", [userId]);
  return result.rows[0] ?? null;
}

export async function createWallet(userId: string, smartAccountAddress: string): Promise<Wallet> {
  const result = await db.query<Wallet>(
    "INSERT INTO wallets (user_id, smart_account_address) VALUES ($1, $2) RETURNING *",
    [userId, smartAccountAddress]
  );
  return result.rows[0];
}
