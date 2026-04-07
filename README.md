# PayTM Clone

A full-stack payment application that enables users to register, authenticate, manage wallets, and transfer money to other users with real-time transaction tracking.

## Tech Stack

| Layer        | Stack                                                                |
| ------------ | -------------------------------------------------------------------- |
| **Frontend** | React + Vite, TailwindCSS, Zod, Axios, React Router, React Hot Toast |
| **Backend**  | Express.js, JWT, bcrypt, Zod, Mongoose                               |
| **Database** | MongoDB Atlas                                                        |
| **Auth**     | JWT-based authentication with bcrypt password hashing                |

## Features

- **User Authentication** — Signup/Signin with email, JWT sessions, and bcrypt-hashed passwords
- **Wallet Management** — Auto-provisioned wallet with balance display
- **Money Transfers** — Instant peer-to-peer transfers with atomic MongoDB transactions
- **Transaction History** — Paginated ledger showing credits and debits with date stamps
- **User Search** — Filter users by name with pagination for large user bases
- **Input Validation** — Zod schemas on both frontend and backend
- **Toast Notifications** — Success/error feedback on all user actions
- **Responsive Design** — Mobile-first TailwindCSS across all pages

## Project Structure

```
paytm/
├── backend/
│   ├── db.js           # MongoDB schemas (User, Account, Transaction)
│   ├── middleware.js   # JWT authentication middleware
│   ├── config.js       # Environment variable exports
│   ├── index.js        # Express server entry point
│   └── routes/
│       ├── index.js    # Router aggregation
│       ├── user.js     # Auth routes: signup, signin, user search
│       └── account.js  # Wallet routes: balance, transfer, logs
├── frontend/
│   └── src/
│       ├── App.jsx     # Route configuration
│       ├── pages/
│       │   ├── Landing.jsx       # Public landing page
│       │   ├── Signin.jsx        # Login with validation
│       │   ├── Signup.jsx        # Registration with validation
│       │   ├── Dashboard.jsx     # Authenticated home (balance + users + transfer)
│       │   ├── SendMoney.jsx     # Transfer money to another user
│       │   └── Transactions.jsx  # Paginated transaction ledger
│       └── components/
│           ├── Appbar.jsx        # Top navigation with logout
│           ├── Users.jsx         # User search with pagination
│           ├── Balance.jsx       # Wallet balance display
│           ├── Button.jsx        # Reusable button component
│           ├── InputBox.jsx      # Form input with error display
│           └── Toasts.jsx        # Toast notification provider
├── Dockerfile
└── BACKLOG.md
```

## API Reference

| Method | Endpoint                                 | Auth | Description                         |
| ------ | ---------------------------------------- | ---- | ----------------------------------- |
| POST   | `/api/v1/user/signup`                    | No   | Register a new user                 |
| POST   | `/api/v1/user/signin`                    | No   | Login and receive JWT token         |
| GET    | `/api/v1/user/bulk?filter=&page=&limit=` | Yes  | Search users (paginated)            |
| GET    | `/api/v1/account/balance`                | Yes  | Get wallet balance                  |
| PUT    | `/api/v1/account/transfer`               | Yes  | Transfer money (atomic transaction) |
| GET    | `/api/v1/account/logs?page=&limit=`      | Yes  | Get transaction history (paginated) |

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Setup

1. **Clone the repository**

   ```bash
   git clone <repo-url>
   cd paytm
   ```

2. **Install dependencies**

   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Configure environment**

   Update `backend/.env`:

   ```env
   DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/paytm
   JWT_SECRET=your-secret
   ```

4. **Start the backend**

   ```bash
   cd backend
   node index.js
   ```

   Server runs on `http://localhost:3000`

5. **Start the frontend**
   ```bash
   cd frontend
   npm run dev
   ```
   Open `http://localhost:5173`

## Development

- Backend uses ES modules (`"type": "module"` in package.json)
- All API calls use `Authorization: Bearer <token>` headers
- Transaction transfers use MongoDB sessions for atomicity
- Input validation runs on both client (Zod) and server (Zod)
