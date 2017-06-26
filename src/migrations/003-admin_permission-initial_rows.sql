INSERT INTO authentication_service.admin_permission (code, name, description) VALUES
  ('CREATE_ADMINS',            'Create admins',            'Allows to create other admins'),
  ('DELETE_ADMINS',            'Delete admins',            'Allows to delete other admins'),
  ('GRANT_ADMIN_PERMISSIONS',  'Grant admin permissions',  'Allows to grant admin permissions'),
  ('REVOKE_ADMIN_PERMISSIONS', 'Revoke admin permissions', 'Allows to revoke admin permissions'),
  ('CREATE_SERVICES',          'Create services',          'Allows to create services'),
  ('DELETE_SERVICES',          'Delete services',          'Allows to delete services'),
  ('CREATE_USERS',             'Create users',             'Allows to create users'),
  ('DELETE_USERS',             'Delete users',             'Allows to delete users'),
  ('CREATE_USER_PERMISSIONS',  'Create user permissions',  'Allows to create user permissions'),
  ('DELETE_USER_PERMISSIONS',  'Delete user permissions',  'Allows to delete user permissions'),
  ('GRANT_USER_PERMISSIONS',   'Grant user permissions',   'Allows to grant user permissions'),
  ('REVOKE_USER_PERMISSIONS',  'Revoke user permissions',  'Allows to revoke user permissions');
