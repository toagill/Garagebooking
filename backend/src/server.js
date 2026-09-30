import express from "express";
import cors from "cors";
import { query } from "./db.js";
import { lookupVehicle } from "./vehicleProvider.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/services", async (_req, res, next) => {
  try {
    const { rows } = await query("SELECT * FROM services ORDER BY price_pence");
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

app.get("/api/vehicle/:registration", async (req, res, next) => {
  try {
    const vehicle = await lookupVehicle(req.params.registration);
    res.json(vehicle);
  } catch (error) {
    next(error);
  }
});

app.get("/api/slots", async (req, res, next) => {
  try {
    const date = req.query.date;
    if (!date) return res.status(400).json({ error: "date is required" });

    const allSlots = ["09:00", "10:00", "11:30", "14:00", "15:30", "16:30"];
    const { rows } = await query(
      "SELECT booking_time::text FROM bookings WHERE booking_date=$1 AND status <> 'cancelled'",
      [date]
    );

    const booked = new Set(rows.map(row => row.booking_time.slice(0, 5)));
    res.json(allSlots.filter(slot => !booked.has(slot)));
  } catch (error) {
    next(error);
  }
});

app.post("/api/bookings", async (req, res, next) => {
  try {
    const { customer, vehicle, serviceId, date, time } = req.body;

    if (!customer || !vehicle || !serviceId || !date || !time) {
      return res.status(400).json({ error: "Missing booking fields" });
    }

    const customerResult = await query(
      "INSERT INTO customers(full_name,email,phone) VALUES($1,$2,$3) RETURNING id",
      [customer.fullName, customer.email, customer.phone]
    );

    const vehicleResult = await query(
      `INSERT INTO vehicles(
        registration,make,colour,fuel_type,year,engine_capacity,
        mot_status,mot_expiry_date,tax_status,tax_due_date
      )
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      ON CONFLICT(registration)
      DO UPDATE SET
        make=EXCLUDED.make,
        colour=EXCLUDED.colour,
        fuel_type=EXCLUDED.fuel_type,
        year=EXCLUDED.year,
        engine_capacity=EXCLUDED.engine_capacity,
        mot_status=EXCLUDED.mot_status,
        mot_expiry_date=EXCLUDED.mot_expiry_date,
        tax_status=EXCLUDED.tax_status,
        tax_due_date=EXCLUDED.tax_due_date
      RETURNING id`,
      [
        vehicle.registration.replace(/\s+/g, "").toUpperCase(),
        vehicle.make,
        vehicle.colour,
        vehicle.fuelType,
        vehicle.year,
        vehicle.engineCapacity,
        vehicle.motStatus,
        vehicle.motExpiryDate || null,
        vehicle.taxStatus,
        vehicle.taxDueDate || null
      ]
    );

    const bookingResult = await query(
      `INSERT INTO bookings(customer_id,vehicle_id,service_id,booking_date,booking_time)
       VALUES($1,$2,$3,$4,$5)
       RETURNING *`,
      [
        customerResult.rows[0].id,
        vehicleResult.rows[0].id,
        serviceId,
        date,
        time
      ]
    );

    res.status(201).json(bookingResult.rows[0]);
  } catch (error) {
    next(error);
  }
});

app.get("/api/bookings", async (_req, res, next) => {
  try {
    const { rows } = await query(`
      SELECT
        b.id,
        b.booking_date,
        b.booking_time,
        b.status,
        c.full_name,
        c.email,
        c.phone,
        v.registration,
        v.make,
        v.mot_status,
        v.mot_expiry_date,
        s.name AS service_name,
        s.price_pence
      FROM bookings b
      JOIN customers c ON c.id=b.customer_id
      JOIN vehicles v ON v.id=b.vehicle_id
      JOIN services s ON s.id=b.service_id
      ORDER BY b.booking_date,b.booking_time
    `);
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.status || 500).json({
    error: error.message || "Internal server error"
  });
});

app.listen(process.env.PORT || 4000, () => {
  console.log(`Garagebooking API listening on port ${process.env.PORT || 4000}`);
});
