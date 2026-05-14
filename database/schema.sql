CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    dark_mode_enabled BOOLEAN NOT NULL DEFAULT false,
    language VARCHAR(2) NOT NULL DEFAULT 'ko' CHECK (language IN ('ko', 'en', 'ja')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT categories_default_owner_check CHECK (
        (is_default = true AND user_id IS NULL)
        OR
        (is_default = false AND user_id IS NOT NULL)
    )
);

CREATE TABLE todos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    status VARCHAR(20) NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'in_progress', 'completed', 'canceled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX categories_default_name_unique
    ON categories (name)
    WHERE is_default = true;

CREATE UNIQUE INDEX categories_user_name_unique
    ON categories (user_id, name)
    WHERE is_default = false;

CREATE INDEX todos_user_id_idx
    ON todos (user_id);

CREATE INDEX todos_user_due_date_idx
    ON todos (user_id, due_date);

CREATE INDEX todos_user_category_idx
    ON todos (user_id, category_id);

CREATE INDEX todos_user_completed_idx
    ON todos (user_id, is_completed);

CREATE INDEX todos_user_status_idx
    ON todos (user_id, status);

CREATE INDEX categories_user_id_idx
    ON categories (user_id);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER categories_set_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER todos_set_updated_at
BEFORE UPDATE ON todos
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

INSERT INTO categories (name, is_default)
VALUES
    ('일반', true),
    ('업무', true),
    ('개인', true),
    ('학습', true)
ON CONFLICT DO NOTHING;
