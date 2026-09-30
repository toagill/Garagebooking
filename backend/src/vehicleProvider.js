const DVLA_URL = "https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles";

export async function lookupVehicle(registration) {
  const normalized = registration.replace(/\s+/g, "").toUpperCase();

  if (!/^[A-Z0-9]{2,8}$/.test(normalized)) {
    const error = new Error("Invalid registration format");
    error.status = 400;
    throw error;
  }

  if (process.env.VEHICLE_API_MODE !== "dvla") {
    return {
      registration: normalized,
      make: "FORD",
      colour: "BLUE",
      fuelType: "PETROL",
      year: 2018,
      engineCapacity: 999,
      motStatus: "Valid",
      motExpiryDate: "2027-01-01",
      taxStatus: "Taxed",
      taxDueDate: "2027-01-01"
    };
  }

  if (!process.env.DVLA_API_KEY) {
    const error = new Error("DVLA API key is not configured");
    error.status = 500;
    throw error;
  }

  const response = await fetch(DVLA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.DVLA_API_KEY
    },
    body: JSON.stringify({ registrationNumber: normalized })
  });

  const body = await response.json().catch(() => ({}));

  if (response.status === 404) {
    const error = new Error("Vehicle not found");
    error.status = 404;
    throw error;
  }

  if (response.status === 429) {
    const error = new Error("DVLA rate limit reached");
    error.status = 429;
    throw error;
  }

  if (!response.ok) {
    const error = new Error(body.message || body.error || "DVLA lookup failed");
    error.status = response.status;
    throw error;
  }

  return {
    registration: body.registrationNumber || normalized,
    make: body.make,
    colour: body.colour,
    fuelType: body.fuelType,
    year: body.yearOfManufacture,
    engineCapacity: body.engineCapacity,
    co2Emissions: body.co2Emissions,
    taxStatus: body.taxStatus,
    taxDueDate: body.taxDueDate,
    motStatus: body.motStatus,
    motExpiryDate: body.motExpiryDate,
    typeApproval: body.typeApproval,
    wheelplan: body.wheelplan,
    dateOfLastV5CIssued: body.dateOfLastV5CIssued,
    monthOfFirstRegistration: body.monthOfFirstRegistration
  };
}
