CREATE TABLE IF NOT EXISTS tenants (
  id             CHAR(36) PRIMARY KEY,
  name           VARCHAR(200) NOT NULL,
  company_email  VARCHAR(100),
  phone_number   VARCHAR(20),
  country        VARCHAR(20),
  address        VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS agencies (
    id CHAR(36) PRIMARY KEY,                
    tenant_id CHAR(36) NOT NULL,             
    agency_name VARCHAR(200) NOT NULL,        
    branch_code VARCHAR(50),                  
    email VARCHAR(200) NOT NULL,              
    phone_number VARCHAR(20),                 
    alternate_phone_number VARCHAR(20),       
    country VARCHAR(100),                     
    address_line_1 VARCHAR(255),              
    address_line_2 VARCHAR(255),             
    pincode VARCHAR(20),                      
    state VARCHAR(100),                       
    city VARCHAR(100)                        
);

CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY,
    tenant_id CHAR(36),
    agency_id CHAR(36),                   
    username VARCHAR(100) NOT NULL UNIQUE,       
    user_role ENUM(
        'TENANT_ADMIN',
        'VP',
        'AGENCY_EXECUTIVE'
    ) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(200) NOT NULL UNIQUE,
    phone_number VARCHAR(20),
    country VARCHAR(100),
    address VARCHAR(500),
    password_hash TEXT NOT NULL,               
    is_active BOOLEAN DEFAULT TRUE,    
    
    -- Generated column for the unique VP constraint
    vp_agency_id CHAR(36) GENERATED ALWAYS AS (
        CASE 
            WHEN user_role = 'VP' THEN agency_id 
            ELSE NULL 
        END
    ) STORED,

    -- Unique index to ensure only one VP exists per agency
    UNIQUE INDEX ux_one_vp_per_agency (vp_agency_id)
);

CREATE TABLE IF NOT EXISTS business_rules (
  id CHAR(36) PRIMARY KEY,
  tenant_id CHAR(36),
  agency_id CHAR(36),
  field_name VARCHAR(100),
  rule_type VARCHAR(50),
  criteria JSON
);

CREATE TABLE IF NOT EXISTS reports (
  id CHAR(36) PRIMARY KEY,
  agent_id CHAR(36),
  status VARCHAR(50),
  pdf_path TEXT
);
