CREATE TABLE authentication_service.service (
  id          BIGSERIAL PRIMARY KEY,
  code        TEXT      NOT NULL UNIQUE,
  name        TEXT      NOT NULL UNIQUE,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  modified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
