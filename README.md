# Trackd - Movie Tracking Application

A full-stack movie tracking application built with React, NestJS, and PostgreSQL.

**Current Version:** 2.0.0-alpha (Monorepo Migration in Progress)

## 📚 Documentation

- **[Project Status Report](./docs/PROJECT_STATUS.md)** - Current state, architecture, features
- **[Immediate Next Steps](./docs/IMMEDIATE_NEXT_STEPS.md)** - Critical decisions and action items
- **[Future Roadmap](./docs/FUTURE_ROADMAP.md)** - Long-term vision and feature plans
- **[Project Structure](./PROJECT_STRUCTURE.md)** - Directory structure overview
- **[Google OAuth Setup](./docs/GOOGLE_OAUTH_SETUP.md)** - OAuth configuration guide

## Features

-  **Secure Authentication**
  - Email/Password authentication with OTP verification
  - Google OAuth 2.0 integration
  - JWT-based access tokens (in-memory)
  - HttpOnly cookies for refresh tokens
  - Password reset functionality
  
-  **Movie Management**
  - Search movies (powered by TMDB API)
  - Mark movies as watched or planned to watch
  - Rate and review movies
  - Personal movie lists

-  **Social Features**
  - Friend system (follow/unfollow)
  - Friend requests (accept/reject)
  - View friends' movie lists

-  **User Profile**
  - Customizable username, name, and bio
  - Email change with verification
  - Password change
  - Profile pictures (Google OAuth avatars)

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite
- Redux Toolkit & RTK Query
- React Router v6
- Tailwind CSS
- Lucide React (icons)

### Backend
- NestJS
- Prisma ORM
- PostgreSQL
- JWT authentication
- Bcrypt for password hashing
- Nodemailer for emails

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- TMDB API key
- Google OAuth credentials (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ashish757/trackd.git
   cd trackd
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd client
   npm install
   ```

3. **Configure environment variables**
   
   Create `.env` files in both `server` and `client` directories:
4. (an .env.example files are provided for reference)
   
   **server/.env:**
   ```env
   ENV=development
   PORT=3000
   FRONTEND_URL=http://localhost:5173
   
   DATABASE_URL="postgresql://user:password@localhost:5432/trackd?schema=public"
   
   JWT_ACCESS_SECRET=your_access_secret_here
   JWT_REFRESH_SECRET=your_refresh_secret_here
   JWT_OTP_SECRET=your_otp_secret_here
   
   # Email configuration (Gmail example)
   EMAIL_USER=your.email@gmail.com
   EMAIL_PASSWORD=your_app_specific_password
   EMAIL_SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   
   # TMDB API
   TMDB_API_KEY=your_tmdb_api_key
   TMDB_READ_ACCESS_TOKEN=your_tmdb_token
   
   # Google OAuth (optional - see docs/GOOGLE_OAUTH_SETUP.md)
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
   ```
   
   **client/.env:**
   ```env
   VITE_ENV=development
   VITE_API_BASE_URL=http://localhost:3000
   ```

4. **Set up the database**
   ```bash
   cd server
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start the development servers**
   
   **Terminal 1 - Backend:**
   ```bash
   cd server
   npm run run dev
   ```
   
   **Terminal 2 - Frontend:**
   ```bash
   cd client
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:5173`

## Google OAuth Setup

For detailed instructions on setting up Google OAuth authentication, see:

📄 **[Google OAuth Setup Guide](./docs/GOOGLE_OAUTH_SETUP.md)**

This includes:
- Google Cloud Console configuration
- Environment variable setup
- Testing the OAuth flow
- Troubleshooting common issues

## Project Structure

```
trackd/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── redux/         # Redux store and slices
│   │   ├── utils/         # Utility functions
│   │   └── config/        # Configuration files
│   └── ...
├── server/                # NestJS backend
│   ├── src/
│   │   ├── modules/       # Feature modules
│   │   ├── common/        # Shared code (guards, filters, etc.)
│   │   ├── config/        # Configuration
│   │   └── utils/         # Utility functions
│   ├── prisma/            # Database schema and migrations
│   └── ...
└── docs/                  # Documentation
```

## API Documentation

The backend provides the following main endpoints:

### Authentication
- `POST /auth/login` - Email/password login
- `POST /auth/register` - User registration
- `POST /auth/send-otp` - Send OTP for email verification
- `POST /auth/verify-otp` - Verify OTP
- `POST /auth/refresh-token` - Refresh access token
- `POST /auth/logout` - Logout user
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/google/callback` - Google OAuth callback
- `POST /auth/forget-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token

### User
- `GET /user/profile` - Get current user profile
- `GET /user/:id` - Get user by ID
- `POST /user/change/username` - Change username
- `POST /user/change/name` - Change display name
- `POST /user/change/bio` - Change bio
- `POST /user/change/password` - Change password
- `POST /auth/change/email/request` - Request email change
- `POST /auth/change/email` - Confirm email change

### Movies
- `GET /movies/search` - Search movies via TMDB
- `GET /movies/trending` - Get trending movies
- `POST /movies/add` - Add movie to database

### User Movies
- `POST /user-movies/entry` - Add/update movie status (watched/planned)
- `DELETE /user-movies/entry/:movieId` - Remove movie from list
- `GET /user-movies/entries` - Get user's movie list
- `POST /user-movies/data` - Add/update movie rating and review
- `GET /user-movies/data/:movieId` - Get movie rating/review

### Friends
- `POST /friend/request` - Send friend request
- `POST /friend/accept/:requestId` - Accept friend request
- `POST /friend/reject/:requestId` - Reject friend request
- `DELETE /friend/cancel/:requestId` - Cancel sent friend request
- `DELETE /friend/unfriend/:friendId` - Unfriend user
- `GET /friend/requests` - Get friend requests
- `GET /friend/status/:userId` - Get friendship status with user

## Security Features

- ✅ JWT access tokens (15 min expiry, stored in memory)
- ✅ Refresh tokens (7 days expiry, HttpOnly cookies)
- ✅ Token rotation on refresh
- ✅ Maximum 5 concurrent sessions per user
- ✅ CSRF protection with SameSite cookies
- ✅ Password hashing with bcrypt
- ✅ OTP-based email verification
- ✅ Rate limiting on sensitive endpoints
- ✅ Input validation with DTOs
- ✅ Global exception handling

## Docker Support

Build and run with Docker Compose:

```bash
docker-compose -f docker-compose.dev.yml up --build
```

## Contact

For questions or support, please open an issue on GitHub.

