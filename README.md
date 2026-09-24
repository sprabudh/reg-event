# Eventora 🎟️

A robust, full-stack event management and ticketing platform designed to streamline registrations, generate secure digital tickets, manage paid bookings with refunds, and handle day-of check-ins. Built with Spring Boot and React, Eventora provides a seamless experience for administrators managing large-scale corporate events and users securing their spots.

---

## 🚀 Tech Stack

**Frontend:**
- React.js (Vite)
- React Router DOM (Declarative routing)
- Axios (HTTP client for API requests)
- Vanilla CSS (Responsive card layouts and grids)

**Backend:**
- Java 17 / Spring Boot 3
- Spring Security (JWT-based stateless authentication)
- Spring Data JPA / Hibernate
- Google ZXing (Core library for dynamic Base64 QR code generation)
- Bean Validation (Jakarta Validation for DTO and entity constraints)

**Database:**
- PostgreSQL (Containerized via Docker)
- Relational schema with strict data constraints and indexed columns

---

## ✨ Key Features

- **Secure QR Code Ticketing:** Automatic generation of Base64 QR code tickets embedded with cryptographically secure UUIDs upon successful registration.
- **Smart Day-Of Check-In System:** Time-aware admin check-in endpoints that restrict ticket scanning to the exact date of the event, actively preventing duplicate check-ins or ticket sharing.
- **Dynamic Capacity & Waitlisting:** Real-time seat tracking that automatically routes overflow registrations to a Waitlist status.
- **Role-Based Access Control (RBAC):** Distinct dashboards and routing capabilities for `ADMIN` and `USER` roles.
- **JWT Authentication:** Secure login and registration flows featuring strict 8-character password validation and stateless session management.
- **Comprehensive Event Management:** Complete admin CRUD control over event creation, modification, and deletion, utilizing unified, DRY React forms, search, category filtering, and optimized pagination (page size 15, 5-card responsive grid).
- **Automatic Event Expiry:** An event is considered **ended** once its date, start time (`HH:mm`), and duration (e.g. `2h`, `3 hours`, `90 min`) have passed. Ended events are automatically hidden from the user catalog, blocked from new registrations (HTTP 400), flagged with an **"Ended"** badge and ended-notice UI in the admin, and excluded from user dashboards — all without manual admin action.
- **Past-Time Create/Edit Guard:** Admins cannot create or modify an event whose scheduled start time has already passed (HTTP 400) — preventing accidental edits to past events.
- **Paid Ticketing & Auto-Invoicing:** Events support a price (price `0`/null = free). Every paid registration creates a payment record with a unique invoice number (`INV-{year}-{6-digit}`), amount, and payment timestamp.
- **Refund & Cancellation Policy:** Events have a *refundable* toggle. Cancelling a registration marks the payment as **REFUNDED** (refundable events) or **FORFEITED** (non-refundable events). Free-event and legacy cancellations generate a ₹0 record with a **"No Refund (Free)"** badge.
- **Admin Payments & Refunds Panel:** Per-event payment history (invoice, attendee, amount, date, refund badge), attendee ticket viewing, one-click refunds, waitlist admission, and a global financial summary (total revenue, refunded amount, active bookings, cancellations).
- **User Dashboard & Opportunities:** Real-time total active-event count plus a **"Latest Opportunities"** list that shows the newest events, excluding both already-expired events and events the user has already registered for.
- **Input Validation:** Mobile numbers must be exactly 10 digits; event dates must be today or in the future.
- **Database Seeding:** Automated master-admin account creation on application startup.

---

## 🗄️ Database Schema

Hibernate auto-generates the schema on first startup (`spring.jpa.hibernate.ddl-auto=update`):

| Table | Purpose |
|-------|---------|
| `users` | Role-based accounts (`ADMIN` / `USER`) |
| `categories` | Event categories |
| `events` | Event details, capacity, price, `is_online`, `is_refundable`, time & duration |
| `attendees` | Registrations, 10-digit mobile number, registration status (`CONFIRMED` / `WAITLISTED` / `CANCELLED`), QR UUID |
| `payments` | Payment & refund history: invoice number (unique), amount, `refund_status` (`NONE` / `REFUNDED` / `FORFEITED`), `paid_at`, `cancelled_at`, attendee & event name snapshots |

---

## 🛠️ Local Setup & Installation

### Prerequisites
Make sure you have the following installed on your machine:
- Docker Desktop
- Java 17+
- Node.js & npm

### 1. Start the Database
The application uses Docker to spin up a local PostgreSQL instance. Open your terminal at the project root and run:

```bash
docker compose up -d
```

The database container (`event-postgres-db`, PostgreSQL 16) maps its internal port `5432` to your machine's **`5434`** with credentials `eventuser` / `eventpass` and database `eventdb`.

> **Note:** Hibernate is configured to automatically generate the required tables (`users`, `categories`, `events`, `attendees`, `payments`) on the first application startup.

### 2. Start the Spring Boot Backend
Open the project in your preferred Java IDE (IntelliJ IDEA / Eclipse) and run the `EventRegApplication.java` file, or use Maven:

```bash
./mvnw spring-boot:run
```

The backend will start on `http://localhost:8080`.

> **Note:** The database seeder will automatically generate the master admin account on the first run.

### 3. Start the React Frontend
Open a new terminal, navigate to the frontend directory, install the dependencies, and start the Vite development server:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be accessible at `http://localhost:5173`.

---

## 🔐 Security, Roles & Credentials

### Default Admin Credentials
To test the admin dashboard and event creation workflow, log in with the seeded credentials:

- **Email:** `admin@eventreg.com`
- **Password:** `admin123`

### Role Capabilities

| Role | Capabilities |
|------|-------------|
| **Admin** (`ROLE_ADMIN`) | Manage event categories; create/edit/delete events (with past-time guards); view attendee data; view payment & refund history per event; process refunds, waitlist admissions, and day-of ticket check-ins; access the financial summary dashboard. |
| **User** (`ROLE_USER`) | Browse the upcoming event catalog (ended events auto-hidden); register for events with a 10-digit mobile number; view personal digital QR tickets; cancel their own registrations prior to check-in (subject to the event's refund policy). |

**Authentication:** All protected API endpoints require a valid `Bearer <JWT_TOKEN>` in the `Authorization` header.

---

## 🗺️ Roadmap & Future Enhancements

- **Automated Email Ticketing:** Integration with `spring-boot-starter-mail` to automatically email users their QR code tickets upon registration.
- **Admin Data Export:** One-click CSV/Excel downloads of the attendee and payment lists for offline door management.
- **Multi-Tenant Organizers:** Introduction of a third `ORGANIZER` role with an approval pipeline, allowing external hosts to submit and manage their own events under Super Admin supervision.