# Event Registration System

A full-stack event management dashboard that allows administrators to securely create, update, and manage corporate events, while allowing users to browse and register for them.

## 🚀 Tech Stack
* **Frontend:** React (Vite), Axios, React Router
* **Backend:** Java, Spring Boot, Spring Security, Hibernate/JPA
* **Database:** PostgreSQL (Containerized via Docker)
* **Security:** JWT (JSON Web Tokens) & Role-Based Access Control (RBAC)

## ✨ Key Features
* **Role-Based Routing:** Distinct access levels for `ADMIN` and `USER` roles.
* **JWT Authentication:** Secure login and registration flows with stateless session management.
* **Full CRUD Operations:** Complete admin control over event creation, modification, and deletion.
* **Database Seeding:** Automated master-admin account creation on application startup.
* **Pagination:** Optimized data fetching for large event lists.

## 🛠️ Local Setup & Installation

### Prerequisites
Make sure you have the following installed on your machine:
* [Docker Desktop](https://www.docker.com/products/docker-desktop)
* [Java 17+](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html)
* [Node.js](https://nodejs.org/en/) & npm

### 1. Start the Database
The application uses Docker to spin up a local PostgreSQL instance.
```bash
docker-compose up -d
```

### 2. Start the Spring Boot Backend
Open the project in your preferred Java IDE (IntelliJ/Eclipse) and run the `EventRegApplication.java` file. The backend will start on `http://localhost:8080`.

*Note: The database seeder will automatically generate the master admin account on the first run.*

### 3. Start the React Frontend
Open a new terminal, navigate to the frontend directory, install the dependencies, and start the Vite development server:
```bash
cd frontend
npm run dev
```
The frontend will be accessible at `http://localhost:5173`.

## 🔐 Default Admin Credentials
To test the admin dashboard, log in with the seeded credentials:
* **Email:** admin@eventreg.com
* **Password:** admin123