# PayTM Clone

A full-stack payment application that enables users to register, authenticate, manage wallets, and transfer money to other users with real-time transaction tracking. Built with modern web technologies and security best practices.

## Tech Stack

| Layer        | Stack                                                                |
| ------------ | -------------------------------------------------------------------- |
| **Frontend** | React + Vite, TailwindCSS, Zod, React Router, React Hot Toast |
| **Backend**  | Express.js, JWT, bcrypt, Zod, Mongoose, Winston Logger       |
| **Database** | MongoDB Atlas                                                        |
| **Auth**     | JWT authentication with refresh tokens, bcrypt password hashing                |

## Features

### Authentication & Security
- **User Registration & Login** — Signup/Signin with email validation, JWT sessions, and bcrypt-hashed passwords
- **Refresh Tokens** — Long-lived refresh tokens for persistent sessions with JWT access tokens
- **Remember Me** — Optional persistent login with extended token storage
- **Rate Limiting** — Express rate limiting (100 requests per 15 minutes) to prevent abuse
- **Password Reset** — Token-based password reset flow with email integration ready
- **Change Password** — Authenticated password change with current password verification
- **Auto-logout** — 30-minute inactivity timeout for session security
- **Structured Error Codes** — Consistent error responses with named error codes (e.g., `INVALID_CREDENTIALS`, `EMAIL_TAKEN`)

### Wallet & Transactions
- **Wallet Management** — Auto-provisioned wallet with random initial balance on signup
- **Money Transfers** — Instant peer-to-peer transfers with atomic MongoDB transactions
- **Transaction History** — Paginated transaction ledger with credits, debits, and timestamps
- **Date Filtering** — Filter transactions by custom date range
- **Transaction Details** — Modal view with full transaction details (ID, type, amount, note, date/time)
- **Recent Contacts** — Quick access to frequent transfer recipients on dashboard

### User Experience
- **Dark Mode** — Full dark/light theme toggle with system preference detection and localStorage persistence
- **User Search** — Filter users by name with pagination for large user bases
- **Profile Management** — View and update profile information (name, email)
- **Skeleton Loaders** — Smooth loading states across all data-fetching components
- **Toast Notifications** — Success/error feedback on all user actions via React Hot Toast
- **Responsive Design** — Mobile-first TailwindCSS across all pages
- **Floating Action Button** — Quick access to send money from dashboard

### Developer Experience
- **Input Validation** — Zod schemas on both frontend and backend
- **Request Logging** — Winston-based request and error logging
- **Environment Configuration** — Separate config for backend (dotenv) and frontend (Vite env vars)
- **CORS Configuration** — Configured for cross-origin requests with credentials support

## Project Structure

```
paytm/
├── backend/
│   ├── db.js                 # MongoDB schemas (User, Account, Transaction, RefreshToken, ResetToken)
│   ├── middleware.js          # JWT authentication middleware
│   ├── config.js             # Environment variable exports (JWT secrets)
│   ├── index.js              # Express server entry point with error handling
│   ├── utils/
│   │   └── logger.js        # Winston logger configuration
│   └── routes/
│       ├── index.js          # Router aggregation
│       ├── user.js           # Auth routes: signup, signin, refresh, profile, password reset
│       └── account.js        # Wallet routes: balance, transfer, logs, contacts
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx          # Route configuration, theme provider, auto-logout
│   │   ├── config.js        # Backend URL configuration with env var support
│   │   ├── main.jsx         # React entry point
│   │   ├── pages/
│   │   │   ├── Landing.jsx         # Public landing page with features
│   │   │   ├── Signin.jsx          # Login with validation and remember me
│   │   │   ├── Signup.jsx          # Registration with validation
│   │   │   ├── Dashboard.jsx       # Authenticated home (balance + users + transfer FAB)
│   │   │   ├── SendMoney.jsx       # Transfer money to another user
│   │   │   ├── Transactions.jsx    # Paginated transaction ledger with filters
│   │   │   ├── Profile.jsx         # Profile view/edit and password change
│   │   │   ├── RequestReset.jsx    # Password reset request form
│   │   │   └── ResetPassword.jsx   # Password reset with token
│   │   └── components/
│   │       ├── Appbar.jsx           # Top navigation with logout and profile link
│   │       ├── Users.jsx            # User search with pagination and recent contacts
│   │       ├── Balance.jsx          # Wallet balance display with refresh
│   │       ├── Button.jsx           # Reusable button component
│   │       ├── InputBox.jsx         # Form input with error display
│   │       ├── Skeleton.jsx         # Loading skeleton components
│   │       ├── Heading.jsx         # Page heading component
│   │       ├── SubHeading.jsx      # Page subheading component
│   │       ├── BottomWarning.jsx   # Navigation link component
│   │       └── Toasts.jsx          # Toast notification provider
└── BACKLOG.md
```

## API Reference

### Authentication Routes

| Method | Endpoint                              | Auth | Description                                  |
| ------ | ------------------------------------- | ---- | -------------------------------------------- |
| POST   | `/api/v1/user/signup`                 | No   | Register a new user with validation           |
| POST   | `/api/v1/user/signin`                 | No   | Login and receive JWT + refresh tokens       |
| POST   | `/api/v1/user/refresh`                | No   | Refresh access token using refresh token      |
| GET    | `/api/v1/user/me`                     | Yes  | Get current user profile                    |
| PUT    | `/api/v1/user/`                       | Yes  | Update user profile (name)                  |
| POST   | `/api/v1/user/change-password`        | Yes  | Change password with current password check  |
| POST   | `/api/v1/user/request-password-reset` | No   | Request password reset token                 |
| POST   | `/api/v1/user/reset-password`         | No   | Reset password with token                   |
| GET    | `/api/v1/user/bulk?filter=&page=&limit=` | Yes | Search users (paginated)                   |

### Account Routes

| Method | Endpoint                                 | Auth | Description                              |
| ------ | ---------------------------------------- | ---- | ---------------------------------------- |
| GET    | `/api/v1/account/balance`                | Yes  | Get wallet balance                        |
| PUT    | `/api/v1/account/transfer`               | Yes  | Transfer money (atomic transaction)        |
| GET    | `/api/v1/account/logs?page=&limit=&startDate=&endDate=` | Yes | Get transaction history (paginated, date-filtered) |
| GET    | `/api/v1/account/contacts?limit=`        | Yes  | Get recent transfer contacts              |

## Error Codes

| Code | Description |
| ---- | ----------- |
| `VALIDATION_ERROR` | Input validation failed |
| `EMAIL_TAKEN` | Email already registered |
| `INVALID_CREDENTIALS` | Wrong email or password |
| `INVALID_PASSWORD` | Current password incorrect (change password) |
| `USER_NOT_FOUND` | User does not exist |
| `PASSWORD_CHANGED` | Password changed successfully |
| `RESET_REQUESTED` | Password reset requested |
| `INVALID_TOKEN` | Invalid or expired token |
| `TOKEN_EXPIRED` | Token has expired |
| `TOKEN_REFRESHED` | Access token refreshed |
| `SIGNUP_SUCCESS` | User registered successfully |
| `SIGNIN_SUCCESS` | User logged in successfully |
| `UPDATE_SUCCESS` | Profile updated successfully |
| `PROFILE_FETCHED` | Profile fetched successfully |
| `USERS_FETCHED` | Users fetched successfully |
| `MISSING_TOKEN` | Refresh token not provided |

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

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

3. **Configure environment (backend)**

   Create `backend/.env`:

   ```env
   DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/paytm
   JWT_SECRET=your-jwt-secret-key
   REFRESH_TOKEN_SECRET=your-refresh-token-secret
   PORT=3000
   NODE_ENV=development
   ```

4. **Configure environment (frontend)**

   Create `frontend/.env`:

   ```env
   VITE_BACKEND_URL=http://localhost:3000
   ```

   For production, set to your deployed backend URL.

5. **Start the backend**

   ```bash
   cd backend
   node index.js
   ```

   Server runs on `http://localhost:3000` (or configured PORT)

6. **Start the frontend**

   ```bash
   cd frontend
   npm run dev
   ```

   Open `http://localhost:5173`

## Deployment

### Backend (Render.com)

1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Set build command: `npm install`
4. Set start command: `node index.js`

### Frontend (Render.com)

1. Create a static site on Render
2. Set environment variable: `VITE_BACKEND_URL=https://your-backend.onrender.com`
3. Set build command: `npm install && npm run build`
4. Set publish directory: `dist`

## Development Notes

- Backend uses ES modules (`"type": "module"` in package.json)
- All API calls use `Authorization: Bearer <token>` headers
- Transaction transfers use MongoDB sessions for atomicity
- Input validation runs on both client (Zod) and server (Zod)
- Frontend uses native `fetch` API (axios removed for lighter bundle)
- Theme preference stored in `localStorage` with key `theme`
- Auto-logout tracks: click, keypress, scroll, mousemove events

## Changelog

### Latest (v2.0)
- Fixed dark mode inconsistencies across Profile, Balance, and other components
- Replaced axios with native fetch API across all frontend components
- Fixed API 404 errors for `/api/v1/user/me` and `/api/v1/user/change-password`
- Improved error handling with proper error message extraction
- Added environment variable support for backend URL (`VITE_BACKEND_URL`)

### v1.1
- Added dark mode toggle with system preference detection
- Implemented password reset flow with token-based reset
- Added change password functionality with current password verification
- Added skeleton loaders for better loading UX
- Implemented date filtering for transaction history
- Added structured error codes for all API responses
- Added recent contacts section on dashboard

### v1.0
- Initial release with user authentication
- Wallet management with balance display
- Peer-to-peer money transfers
- Transaction history with pagination
- User search with filtering
- Rate limiting and security improvements
- Refresh token mechanism
- Remember me functionality
- 30-minute auto-logout on inactivity
