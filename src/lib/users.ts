import { db } from "./db.js";

export interface User {
  id: string;
  identifier: string;
  identifier_type: "phone" | "email";
  kyc_status: "pending" | "submitted" | "approved" | "rejected";
  created_at: string;
}

export function identifierType(identifier: string): "phone" | "email" {
  return /^\+?[0-9]+$/.test(identifier) ? "phone" : "email";
}

export async function findOrCreateUser(identifier: string): Promise<User> {
  const type = identifierType(identifier);
  const existing = await db.query<User>("SELECT * FROM users WHERE identifier = $1", [identifier]);
  if (existing.rows[0]) {
    return existing.rows[0];
  }

  const inserted = await db.query<User>(
    "INSERT INTO users (identifier, identifier_type) VALUES ($1, $2) RETURNING *",
    [identifier, type]
  );
  return inserted.rows[0];
}
