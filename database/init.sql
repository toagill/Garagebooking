CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  price_pence INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  registration VARCHAR(20) UNIQUE NOT NULL,
  make VARCHAR(80),
  colour VARCHAR(50),
  fuel_type VARCHAR(50),
  year INTEGER,
  engine_capacity INTEGER,
  mot_status VARCHAR(50),
  mot_expiry_date DATE,
  tax_status VARCHAR(50),
  tax_due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id),
  service_id INTEGER NOT NULL REFERENCES services(id),
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO services (name, price_pence, duration_minutes)
SELECT * FROM (VALUES
  ('MOT Test', 5485, 45),
  ('Full Service', 18000, 120),
  ('Oil & Filter Change', 8000, 45),
  ('Brake Inspection', 6000, 45),
  ('Diagnostics', 5000, 30)
) AS s(name, price_pence, duration_minutes)
WHERE NOT EXISTS (SELECT 1 FROM services);
