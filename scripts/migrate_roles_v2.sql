-- Role model v2: designer responsibilities are absorbed by product managers;
-- project_manager can manage every business resource except user accounts.
UPDATE users SET role = 'pm' WHERE role = 'designer';
ALTER TABLE users
  MODIFY COLUMN role ENUM('admin', 'pm', 'project_manager', 'developer', 'tester')
  NOT NULL DEFAULT 'developer' COMMENT '角色';
