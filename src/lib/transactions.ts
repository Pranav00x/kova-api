import { db } from "./db.js";
import { mccToCategory } from "./mcc.js";

export interface Transaction {
  id: string;
  user_id: string;
  amount_usdc: string;
  merchant_name: string;
  mcc_code: string;
  category: string;
  occurred_at: string;
}

export async function recordTransaction(
  userId: string,
  amountUsdc: number,
  merchantName: string,
  mccCode: string
): Promise<Transaction> {
  const category = mccToCategory(mccCode);
  const result = await db.query<Transaction>(
    `INSERT INTO transactions (user_id, amount_usdc, merchant_name, mcc_code, category)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, amountUsdc, merchantName, mccCode, category]
  );
  return result.rows[0];
}

export async function listTransactions(userId: string, limit = 50): Promise<Transaction[]> {
  const result = await db.query<Transaction>(
    "SELECT * FROM transactions WHERE user_id = $1 ORDER BY occurred_at DESC LIMIT $2",
    [userId, limit]
  );
  return result.rows;
}

export interface CategoryBreakdown {
  category: string;
  totalUsdc: string;
  transactionCount: string;
}

export async function getMonthlyAnalytics(userId: string): Promise<CategoryBreakdown[]> {
  const result = await db.query<CategoryBreakdown>(
    `SELECT category,
            SUM(amount_usdc)::text AS "totalUsdc",
            COUNT(*)::text AS "transactionCount"
     FROM transactions
     WHERE user_id = $1
       AND occurred_at >= date_trunc('month', now())
     GROUP BY category
     ORDER BY SUM(amount_usdc) DESC`,
    [userId]
  );
  return result.rows;
}
