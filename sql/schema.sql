-- Xpense Postgres schema
-- Transaction type: 0 = NECESSITY, 1 = MODERATE, 2 = LUXURY
-- Categories are either system defaults or user-created.

CREATE TABLE IF NOT EXISTS users (
    user_id      BIGSERIAL PRIMARY KEY,
    google_id    VARCHAR(255) NOT NULL,
    email        VARCHAR(255) NOT NULL,
    first_name   VARCHAR(100) NOT NULL,
    last_name    VARCHAR(100) NOT NULL,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    last_login   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_users_google_id UNIQUE (google_id),
    CONSTRAINT uq_users_email UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS categories (
    category_id    BIGSERIAL PRIMARY KEY,
    category_name  VARCHAR(100) NOT NULL,
    user_id        BIGINT       NOT NULL,
    CONSTRAINT fk_category_user
        FOREIGN KEY (user_id) REFERENCES users (user_id),
    CONSTRAINT uq_category_name_per_user UNIQUE (user_id, category_name)
);

CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories (user_id);

-- Reserved owner for categories visible to every user.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM users
        WHERE user_id = 1 AND google_id <> 'SYSTEM'
    ) THEN
        RAISE EXCEPTION 'user_id 1 already belongs to a real user';
    END IF;

    IF EXISTS (
        SELECT 1 FROM users
        WHERE google_id = 'SYSTEM' AND user_id <> 1
    ) THEN
        RAISE EXCEPTION 'SYSTEM user exists with an id other than 1';
    END IF;

    INSERT INTO users (user_id, google_id, email, first_name, last_name)
    VALUES (1, 'SYSTEM', 'system@xpense.local', 'Xpense', 'System')
    ON CONFLICT (user_id) DO NOTHING;
END
$$;

-- The next real user receives user_id 2.
SELECT setval(
    pg_get_serial_sequence('users', 'user_id'),
    (SELECT MAX(user_id) FROM users)
);

INSERT INTO categories (category_name, user_id)
SELECT default_name, default_owner.user_id
FROM (
    VALUES
        ('Rent'),
        ('Groceries'),
        ('Utilities'),
        ('Transport'),
        ('Healthcare'),
        ('Education'),
        ('Entertainment'),
        ('Other')
) AS defaults(default_name)
CROSS JOIN (VALUES (1::BIGINT)) AS default_owner(user_id)
ON CONFLICT (user_id, category_name) DO NOTHING;

CREATE TABLE IF NOT EXISTS transactions (
    transaction_id    BIGSERIAL PRIMARY KEY,
    description       VARCHAR(500)   NOT NULL,
    amount            NUMERIC(12, 2) NOT NULL,
    transaction_date  DATE           NOT NULL,
    category_id       BIGINT         NOT NULL,
    user_id           BIGINT         NOT NULL,
    type              SMALLINT       NOT NULL,
    created_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_transactions_category
        FOREIGN KEY (category_id) REFERENCES categories (category_id),
    CONSTRAINT fk_transactions_user
        FOREIGN KEY (user_id) REFERENCES users (user_id),
    CONSTRAINT chk_transactions_type CHECK (type IN (0, 1, 2)),
    CONSTRAINT chk_transactions_amount CHECK (amount > 0)
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions (user_id);