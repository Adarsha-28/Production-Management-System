# Prodexa – Manufacturing & Production Management ERP

A full-stack enterprise-grade ERP system built with Spring Boot + React.

---

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Node.js 18+
- PostgreSQL 14+
- Maven 3.8+

---

## ⚙️ Backend Setup

### 1. Create PostgreSQL Database
```sql
CREATE DATABASE prodexa_db;
```

### 2. Configure credentials
Edit `backend/src/main/resources/application.properties`:
```properties
spring.datasource.username=your_postgres_user
spring.datasource.password=your_postgres_password
```

### 3. Run the backend
```bash
cd backend
mvn spring-boot:run
```
Backend starts at: **http://localhost:8080**

> The database is auto-seeded with realistic sample data on first run.

---

## 🎨 Frontend Setup

```bash
cd frontend
npm install
npm start
```
Frontend starts at: **http://localhost:3000**

---

## 👥 Demo Accounts

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Production Manager | `sarah.pm` | `pass123` |
| Inventory Manager | `mike.inv` | `pass123` |
| Machine Operator | `john.op` | `pass123` |
| Quality Analyst | `emma.qa` | `pass123` |

---

## 🏗️ Architecture

```
backend/
├── config/          # Security, CORS, Data Seeder
├── controller/      # REST API endpoints
├── dto/             # Data Transfer Objects
├── entity/          # JPA Entities
├── exception/       # Global Exception Handler
├── repository/      # Spring Data JPA Repositories
├── security/        # JWT Auth Filter, UserDetailsService
└── service/         # Business Logic

frontend/
├── api/             # Axios API calls
├── components/      # Layout, Sidebar, Navbar, Chatbot, UI
├── context/         # Auth & Theme Context
└── pages/
    ├── admin/       # User Management, Audit Logs, Analytics
    ├── dashboards/  # Role-specific dashboards
    └── ...          # Production, Inventory, Machines, Profile
```

---

## 🔐 API Endpoints

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/register` | Public |
| GET | `/api/dashboard/stats` | Authenticated |
| GET/POST/PUT/DELETE | `/api/production` | Auth |
| GET/POST/PUT/DELETE | `/api/inventory` | Auth |
| GET/POST/PUT/DELETE | `/api/machines` | Auth |
| GET | `/api/notifications` | Auth |
| GET/PUT/DELETE | `/api/admin/**` | Admin only |
| POST | `/api/chatbot/message` | Auth |

---

## ✨ Features

- ✅ JWT Authentication with BCrypt passwords
- ✅ 5 Role-based dashboards with strict access control
- ✅ Production Planning with CRUD + progress tracking
- ✅ Inventory Management with low-stock alerts
- ✅ Machine Monitoring with status cards
- ✅ Analytics with Recharts (Bar, Line, Area, Pie, Radar)
- ✅ AI Chatbot assistant
- ✅ Dark/Light mode toggle
- ✅ Collapsible sidebar
- ✅ Notification system
- ✅ Profile management with password change
- ✅ Admin: User management + Audit logs
- ✅ Fully seeded database
- ✅ Glassmorphism UI with Framer Motion animations
- ✅ Responsive design
