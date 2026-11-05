-- CockroachDB Schema for CardioTrack ZA
-- Database: cardiotrack_db

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'patient',
  blood_type VARCHAR(10) DEFAULT 'O+',
  dob VARCHAR(20) DEFAULT '1990-01-01',
  phone VARCHAR(50) DEFAULT '+27 82 000 0000',
  medical_aid VARCHAR(255) DEFAULT '',
  hpcsa_number VARCHAR(50) DEFAULT '',
  practice_number VARCHAR(50) DEFAULT '',
  clinic_name VARCHAR(255) DEFAULT '',
  connected_pms JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vitals_telemetry (
  id BIGINT PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  patient_name VARCHAR(255) NOT NULL,
  blood_type VARCHAR(10) DEFAULT 'O+',
  date VARCHAR(20) NOT NULL,
  time VARCHAR(20) NOT NULL,
  heart_rate INT NOT NULL,
  systolic INT NOT NULL,
  diastolic INT NOT NULL,
  oxygen_sat INT DEFAULT 98,
  blood_glucose NUMERIC(4,1) DEFAULT 5.5,
  height NUMERIC(5,1) DEFAULT 175.0,
  weight NUMERIC(5,1) DEFAULT 75.0,
  bmi NUMERIC(4,1) DEFAULT 24.5,
  map INT DEFAULT 90,
  pulse_pressure INT DEFAULT 40,
  pms_synced BOOLEAN DEFAULT true,
  notes TEXT DEFAULT '',
  category VARCHAR(50) DEFAULT 'Normal',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pms_addons (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'connected',
  endpoint_url TEXT,
  practice_number VARCHAR(50),
  auto_sync BOOLEAN DEFAULT true,
  sync_frequency VARCHAR(50) DEFAULT 'realtime',
  last_sync_time TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pms_audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT now(),
  addon_name VARCHAR(255) NOT NULL,
  patient_name VARCHAR(255) NOT NULL,
  action VARCHAR(100) NOT NULL,
  records_transmitted INT DEFAULT 1,
  status VARCHAR(50) DEFAULT 'success',
  response_code INT DEFAULT 200,
  details TEXT
);
