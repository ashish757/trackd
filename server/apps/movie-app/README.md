# Movie App Microservice

This is the movie service microservice that handles all movie-related operations.

## Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in the required environment variables in `.env`:
   - `MOVIE_SERVICE_PORT`: Port for the movie service (default: 3001)
   - `DATABASE_URL`: PostgreSQL connection string
   - `TMDB_API_KEY`: Your TMDB API key
   - `TMDB_ACCESS_TOKEN`: Your TMDB access token
   - `JWT_ACCESS_SECRET`: JWT secret for access tokens
   - `JWT_REFRESH_SECRET`: JWT secret for refresh tokens

## Running the Service

From the root server directory:

```bash
npm run start:dev movie-app
```

The service will run on `http://localhost:3001` (or the port specified in your `.env` file).

## Features

- Movie search and discovery
- TMDB API integration
- User movie lists management
- Movie ratings and reviews

## Environment Variables

The service uses its own `.env` file located at `server/apps/movie-app/.env`. This is separate from the main server's `.env` file to support microservice architecture.

## Notes

- The `.env` file is gitignored for security
- Always use `.env.example` as a reference for required variables
- The service loads environment variables from `../../../.env` when running from the compiled `dist` directory

