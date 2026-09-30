# Garagebooking

Simple 3-tier Garage / MOT booking application.

## Architecture

1. Frontend: React + Vite
2. Backend: Node.js + Express
3. Database: PostgreSQL

The backend also calls the DVLA Vehicle Enquiry API for live UK vehicle data.

## Features

- UK registration lookup
- DVLA vehicle details
- MOT status and expiry
- Tax status and due date
- Service selection
- Appointment date/time selection
- Customer booking
- Booking persistence in PostgreSQL
- Simple booking list API

## Run locally

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Add your DVLA key to `.env`, then run:

```bash
docker compose up --build
```

Open:

- Frontend: http://localhost:5173
- Backend health: http://localhost:4000/health

Test vehicle lookup:

```bash
curl http://localhost:4000/api/vehicle/OW08FBE
```

## 3-tier flow

```
Browser
  |
  v
React frontend
  |
  v
Express API
  |
  +--> DVLA API
  |
  v
PostgreSQL
```

For now this project intentionally avoids Kubernetes, EKS, Jenkins, Terraform and Secrets Manager. Those can be added later after the core 3-tier application is working.
