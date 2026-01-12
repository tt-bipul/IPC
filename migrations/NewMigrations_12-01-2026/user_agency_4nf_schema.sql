SET FOREIGN_KEY_CHECKS = 0;

/* =========================
   USERS (AUTH CORE)
========================= */

CREATE TABLE users (
  id CHAR(36) NOT NULL,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(200) NOT NULL,
  password_hash TEXT NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  is_deleted TINYINT(1) NOT NULL DEFAULT 0,
  last_login_at DATETIME NULL,
  password_updated_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_username (username),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


/* =========================
   USER PROFILE (IDENTITY ONLY)
========================= */

CREATE TABLE user_profiles (
  user_id CHAR(36) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  last_name VARCHAR(100) NOT NULL,
  PRIMARY KEY (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


/* =========================
   USER PHONES (4NF)
========================= */

CREATE TABLE user_phone_numbers (
  id INT AUTO_INCREMENT,
  user_id CHAR(36) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_user_phone (phone_number),
  FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


/* =========================
   USER ADDRESSES (4NF)
========================= */

CREATE TABLE user_addresses (
  id INT AUTO_INCREMENT,
  user_id CHAR(36) NOT NULL,
  address VARCHAR(500) NOT NULL,
  country VARCHAR(100),
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


/* =========================
   ROLES
========================= */

CREATE TABLE roles (
  id INT NOT NULL AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_roles_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


/* =========================
   USER ↔ ROLES (M:N, 4NF)
========================= */

CREATE TABLE user_roles (
  user_id CHAR(36) NOT NULL,
  role_id INT NOT NULL,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


/* =========================
   AGENCIES (CORE)
========================= */

CREATE TABLE agencies (
  id CHAR(36) NOT NULL,
  agency_name VARCHAR(200) NOT NULL,
  branch_code VARCHAR(50),
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  vp_user_id CHAR(36),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (vp_user_id) REFERENCES users(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


/* =========================
   LOCATIONS (INDEPENDENT DIMENSION)
========================= */

CREATE TABLE locations (
  id INT AUTO_INCREMENT,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  pincode VARCHAR(20) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_location (city, state, country, pincode)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


/* =========================
   ADDRESSES
========================= */

CREATE TABLE addresses (
  id INT AUTO_INCREMENT,
  address_line_1 VARCHAR(255) NOT NULL,
  address_line_2 VARCHAR(255),
  location_id INT NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (location_id) REFERENCES locations(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


/* =========================
   CONTACTS
========================= */

CREATE TABLE contacts (
  id INT AUTO_INCREMENT,
  email VARCHAR(200) NOT NULL,
  phone_number VARCHAR(20),
  alternate_phone_number VARCHAR(20),
  PRIMARY KEY (id),
  UNIQUE KEY uq_contact_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


/* =========================
   AGENCY ↔ ADDRESSES (4NF)
========================= */

CREATE TABLE agency_addresses (
  agency_id CHAR(36) NOT NULL,
  address_id INT NOT NULL,
  PRIMARY KEY (agency_id, address_id),
  FOREIGN KEY (agency_id) REFERENCES agencies(id)
    ON DELETE CASCADE,
  FOREIGN KEY (address_id) REFERENCES addresses(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


/* =========================
   AGENCY ↔ CONTACTS (4NF)
========================= */

CREATE TABLE agency_contacts (
  agency_id CHAR(36) NOT NULL,
  contact_id INT NOT NULL,
  PRIMARY KEY (agency_id, contact_id),
  FOREIGN KEY (agency_id) REFERENCES agencies(id)
    ON DELETE CASCADE,
  FOREIGN KEY (contact_id) REFERENCES contacts(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
