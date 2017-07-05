CREATE TABLE authentication_service.service_admin_xref (
  id                  BIGSERIAL PRIMARY KEY,
  service_id          BIGINT    REFERENCES authentication_service.service(id) NOT NULL,
  admin_id            BIGINT    REFERENCES authentication_service.admin(id) NOT NULL,
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  modified_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
