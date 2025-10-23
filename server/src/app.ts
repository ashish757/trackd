import express, { type Application, type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Initialize the app
const app: Application = express();

// --- Basic Middleware Setup ---

// 1. Enable CORS for all requests
app.use(cors({
  origin: process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : process.env.PRODUCTION_FRONTEND_URL, // use environment variable for production URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// 2. Body Parser: Allows Express to read JSON data sent in the request body
app.use(express.json());

// 3. Simple URL-encoded parser (for form data)
app.use(express.urlencoded({ extended: true }));

// --- Routes Setup ---

// Example Root Route (Health Check)
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Movie Tracker API is running smoothly!',
    environment: process.env.NODE_ENV
  });
});

// Example API Route
app.get('/api/v1/movies/test', (req: Request, res: Response) => {
  res.status(200).json({
    data: [
      { id: 1, title: 'Inception' },
      { id: 2, title: 'Interstellar' }
    ]
  });
});

// --- Server Start ---
const PORT: number = parseInt(process.env.PORT || '8080', 10);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access at http://localhost:${PORT}`);
});

export default app;
