CREATE TABLE authentication_service.admin_permission (
  id          BIGSERIAL PRIMARY KEY,
  code        TEXT      NOT NULL UNIQUE,
  name        TEXT      NOT NULL UNIQUE,
  description TEXT      NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  modified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
