CREATE TABLE authentication_service.admin_permission_xref (
  id                  BIGSERIAL PRIMARY KEY,
  admin_id            BIGINT    REFERENCES authentication_service.admin(id) NOT NULL,
  admin_permission_id BIGINT    REFERENCES authentication_service.admin_permission(id) NOT NULL,
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  modified_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
