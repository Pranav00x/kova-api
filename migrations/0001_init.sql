CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier TEXT UNIQUE NOT NULL, -- phone or email
    identifier_type TEXT NOT NULL CHECK (identifier_type IN ('phone', 'email')),
    kyc_status TEXT NOT NULL DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'submitted', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    smart_account_address TEXT UNIQUE NOT NULL,
    chain TEXT NOT NULL DEFAULT 'base',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
