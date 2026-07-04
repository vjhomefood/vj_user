# 🍱 VJ Home Foods – Customer & Delivery Portal

A full-stack web application for **VJ Home Foods** that enables customers to place food orders, view menus and billing history, while providing delivery partners with a dedicated delivery management portal.

---

# 🏗️ Tech Architecture

```text
                  Frontend
      React + TypeScript + Vite + Axios
                    │
             REST API (HTTPS)
                    │
          Node.js + Express.js
                    │
         JWT Authentication
                    │
       MongoDB Atlas + Mongoose
```

---


# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/<your-username>/<repository-name>.git
cd <repository-name>
```

## Backend

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=5002
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Run the backend:

```bash
npm run dev
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

---

# 🚀 Deployment

| Service | Platform |
|----------|----------|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |

---

# 🔒 Security

- JWT Authentication
- Password Hashing (bcrypt)
- Protected REST APIs
- Environment Variables
- CORS Protection
- Gzip Response Compression

---
# 💻 Tech Stack

### Frontend
- React
- TypeScript
- Vite
- React Router DOM
- Axios
- Tailwind CSS
- Zustand (State Management)
- Motion (Animations)
- Lenis (Smooth Scrolling)
- Lucide React (Icons)

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT Authentication
- bcrypt.js
- dotenv
- CORS
- Compression

---

# ✨ Features

### Customer Portal
- Secure Login
- Browse Daily Menu
- Place Orders
- View Billing History
- Manage Profile

### Delivery Partner Portal
- Secure Login
- Delivery Dashboard
- Order Tracking

### Landing Website
- Responsive Landing Page
- Weekly Meal Plans
- Customer Testimonials
- Smooth Animations

---


Developed with ❤️ for **VJ Home Foods**.
