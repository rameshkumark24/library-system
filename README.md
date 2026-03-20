# Library Management System

A full-stack Library Management System built with **React** (frontend) and **Spring Boot + MySQL** (backend).

## Tech Stack

| Layer    | Technology                      |
|----------|---------------------------------|
| Frontend | React 18, Vite, React Router 6, Axios |
| Backend  | Spring Boot 3.2, Spring Data JPA, Lombok |
| Database | MySQL (cloud)                   |

## Features

- 📚 **Books** – Add, edit, delete, search books with copy tracking
- 👥 **Members** – Register and manage library members
- 📖 **Borrows** – Issue and return books, overdue tracking, fine calculation (₹5/day)
- 📊 **Dashboard** – Real-time statistics (total books, active members, borrows, overdue)

## Project Structure

```
library-system/
├── backend/        Spring Boot REST API
└── frontend/       React Vite application
```

## Getting Started

### 1. Configure MySQL (Cloud)

Edit `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://<HOST>:<PORT>/<DB>?useSSL=true&serverTimezone=UTC
spring.datasource.username=<USERNAME>
spring.datasource.password=<PASSWORD>
```

### 2. Run the Backend (requires Java 17 + Maven)

```bash
cd backend
mvn spring-boot:run
```

Backend starts on `http://localhost:8080`. Database tables are auto-created on first run.

### 3. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend starts on `http://localhost:5173`.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST/PUT/DELETE | `/api/books` | Manage books |
| GET/POST/PUT/DELETE | `/api/members` | Manage members |
| GET | `/api/borrows` | List all borrow records |
| POST | `/api/borrows/issue` | Issue a book |
| PUT | `/api/borrows/return/{id}` | Return a book |
| GET | `/api/dashboard/stats` | Dashboard statistics |
