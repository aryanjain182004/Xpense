-- Run this once on an existing Xpense database.
-- This fails safely if user_id 1 already belongs to a real user.
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
