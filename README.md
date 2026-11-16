# 📚 Bibliotheca – Library Management System (MERN Stack)

A full-stack Library Management System built with MongoDB, Express.js, React, and Node.js.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

---

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

The API runs on **http://localhost:5000**

#### Seed Admin User
After starting the server, run once:
```bash
curl -X POST http://localhost:5000/api/auth/seed
```
This creates: `admin@library.com` / `admin123`

---

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start
```

The app runs on **http://localholst:3000**

---

## 🗂️ Project Structure

```
library-management/
├── backend/
│   ├── models/
│   │   ├── User.js          # Staff accounts (admin/librarian)
│   │   ├── Book.js          # Book catalog
│   │   ├── Member.js        # Library members
│   │   └── Transaction.js   # Borrow/return records
│   ├── routes/
│   │   ├── auth.js          # Login, register, JWT
│   │   ├── books.js         # CRUD for books
│   │   ├── members.js       # CRUD for members
│   │   ├── transactions.js  # Issue & return books
│   │   └── dashboard.js     # Stats & analytics
│   ├── middleware/
│   │   └── auth.js          # JWT verification
│   └── server.js
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── Login.js
        │   ├── Dashboard.js    # Stats, charts, recent activity
        │   ├── Books.js        # Catalog management
        │   ├── Members.js      # Member management
        │   ├── Transactions.js # Issue/return history
        │   └── IssueBook.js    # Issue book workflow
        ├── components/
        │   └── Layout.js       # Sidebar navigation
        ├── context/
        │   └── AuthContext.js  # Auth state
        └── index.css           # Global styles
```

---

## ✨ Features

### Books
- Add, edit, delete books
- Track total & available copies
- Filter by category, availability
- Search by title, author, ISBN
- Shelf/row location tracking

### Members
- Add, edit, delete members
- Auto-generate Member IDs (LIB00001)
- Membership types: Student / Standard / Premium
- Track checked-out books & fines
- Membership expiry tracking

### Transactions
- Issue books to members
- Return books with fine calculation
- Auto-detect overdue (₹5/day)
- Full transaction history
- Mark fines as paid

### Dashboard
- Live stats: books, members, loans, overdue
- Monthly transactions bar chart
- Category distribution pie chart
- Recent activity feed

---

## 🔑 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Register staff |
| POST | `/api/auth/seed` | Create default admin |
| GET | `/api/books` | List books (search, filter, paginate) |
| POST | `/api/books` | Add book |
| PUT | `/api/books/:id` | Update book |
| DELETE | `/api/books/:id` | Delete book |
| GET | `/api/members` | List members |
| POST | `/api/members` | Add member |
| PUT | `/api/members/:id` | Update member |
| DELETE | `/api/members/:id` | Delete member |
| GET | `/api/transactions` | List transactions |
| POST | `/api/transactions/issue` | Issue book |
| PUT | `/api/transactions/:id/return` | Return book |
| GET | `/api/dashboard/stats` | Dashboard analytics |

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router 6, Recharts |
| Styling | Custom CSS with CSS variables |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Auth | JWT (JSON Web Tokens) |
| Notifications | React Hot Toast |

---

## 📋 Environment Variables (backend/.env)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/library_management
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```
