CREATE TABLE authentication_service.admin (
  id          BIGSERIAL PRIMARY KEY,
  email       TEXT      NOT NULL UNIQUE,
  username    TEXT      NOT NULL UNIQUE,
  password    TEXT      NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  modified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
