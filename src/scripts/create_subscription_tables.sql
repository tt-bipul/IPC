-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id INT NOT NULL AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  max_documents INT NOT NULL,
  validity_days INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  is_active TINYINT NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- Create agency_subscriptions table
CREATE TABLE IF NOT EXISTS agency_subscriptions (
  id INT NOT NULL AUTO_INCREMENT,
  agency_id CHAR(36) NOT NULL,
  subscription_plan_id INT NOT NULL,
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  is_active TINYINT NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE,
  FOREIGN KEY (subscription_plan_id) REFERENCES subscription_plans(id)
);

-- Create agency_document_usage table
CREATE TABLE IF NOT EXISTS agency_document_usage (
  id INT NOT NULL AUTO_INCREMENT,
  agency_id CHAR(36) NOT NULL,
  subscription_id INT NOT NULL,
  documents_processed INT NOT NULL DEFAULT 0,
  last_processed_at DATETIME DEFAULT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE,
  FOREIGN KEY (subscription_id) REFERENCES agency_subscriptions(id)
);

-- Create documents table (if it doesn't exist, though typically part of core, but specified in prompt)
CREATE TABLE IF NOT EXISTS documents (
  id CHAR(36) NOT NULL,
  agency_id CHAR(36) NOT NULL,
  uploaded_by CHAR(36) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);
