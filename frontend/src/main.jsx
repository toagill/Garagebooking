import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const API = "/api";

function App() {
  const [registration, setRegistration] = useState("OW08FBE");
  const [vehicle, setVehicle] = useState(null);
  const [services, setServices] = useState([]);
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");
  const [customer, setCustomer] = useState({
    fullName: "",
    email: "",
    phone: ""
  });

  useEffect(() => {
    fetch(API + "/services")
      .then(r => r.json())
      .then(data => {
        setServices(data);
        if (data[0]) setServiceId(String(data[0].id));
      });
  }, []);

  useEffect(() => {
    if (!date) return;
    fetch(API + "/slots?date=" + date)
      .then(r => r.json())
      .then(setSlots);
  }, [date]);

  async function lookupVehicle() {
    setMessage("");
    setVehicle(null);

    const response = await fetch(
      API + "/vehicle/" + encodeURIComponent(registration)
    );
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "Vehicle lookup failed");
      return;
    }

    setVehicle(data);
  }

  async function submitBooking(event) {
    event.preventDefault();
    setMessage("");

    const response = await fetch(API + "/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer,
        vehicle,
        serviceId: Number(serviceId),
        date,
        time
      })
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "Booking failed");
      return;
    }

    setMessage("Booking confirmed. Reference #" + data.id);
  }

  return (
    <div className="page">
      <header>
        <div>
          <strong>Garagebooking</strong>
          <span>MOT & vehicle servicing</span>
        </div>
      </header>

      <main>
        <section className="hero">
          <div>
            <p className="eyebrow">UK GARAGE BOOKING</p>
            <h1>Check your vehicle and book your garage visit.</h1>
            <p>
              Enter a registration to retrieve live DVLA information, then choose
              your service and appointment.
            </p>
          </div>

          <div className="card">
            <label>Registration</label>
            <div className="reg">
              <span>GB</span>
              <input
                value={registration}
                onChange={e => setRegistration(e.target.value.toUpperCase())}
              />
            </div>
            <button onClick={lookupVehicle}>Check vehicle</button>
          </div>
        </section>

        {vehicle && (
          <section className="card vehicle">
            <h2>{vehicle.make} — {vehicle.registration}</h2>
            <div className="vehicleGrid">
              <Info label="Year" value={vehicle.year} />
              <Info label="Colour" value={vehicle.colour} />
              <Info label="Fuel" value={vehicle.fuelType} />
              <Info label="Engine" value={vehicle.engineCapacity ? vehicle.engineCapacity + " cc" : "-"} />
              <Info label="MOT status" value={vehicle.motStatus} />
              <Info label="MOT expiry" value={vehicle.motExpiryDate} />
              <Info label="Tax status" value={vehicle.taxStatus} />
              <Info label="Tax due" value={vehicle.taxDueDate} />
              <Info label="CO2" value={vehicle.co2Emissions ? vehicle.co2Emissions + " g/km" : "-"} />
              <Info label="Wheelplan" value={vehicle.wheelplan} />
            </div>
          </section>
        )}

        <section className="card booking">
          <h2>Book an appointment</h2>

          <form onSubmit={submitBooking}>
            <div className="grid">
              <label>
                Service
                <select
                  value={serviceId}
                  onChange={e => setServiceId(e.target.value)}
                >
                  {services.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name} — £{(service.price_pence / 100).toFixed(2)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Date
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required
                />
              </label>

              <label>
                Time
                <select
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  required
                >
                  <option value="">Choose a slot</option>
                  {slots.map(slot => (
                    <option key={slot}>{slot}</option>
                  ))}
                </select>
              </label>
            </div>

            <h3>Your details</h3>

            <div className="grid">
              <label>
                Full name
                <input
                  value={customer.fullName}
                  onChange={e =>
                    setCustomer({ ...customer, fullName: e.target.value })
                  }
                  required
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  value={customer.email}
                  onChange={e =>
                    setCustomer({ ...customer, email: e.target.value })
                  }
                  required
                />
              </label>

              <label>
                Phone
                <input
                  value={customer.phone}
                  onChange={e =>
                    setCustomer({ ...customer, phone: e.target.value })
                  }
                  required
                />
              </label>
            </div>

            <button className="primary" disabled={!vehicle}>
              Confirm booking
            </button>
          </form>

          {message && <p className="message">{message}</p>}
        </section>
      </main>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="info">
      <span>{label}</span>
      <strong>{value || "-"}</strong>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
