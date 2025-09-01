# Trackd - Movie Tracker Webapp

A modern, responsive movie tracking application built with React, TypeScript, and Vite. Track your favorite movies, rate them, and discover new films with a beautiful movie-themed interface.

## 🎬 Features

### Core Functionality
- **Movie Tracking**: Add movies to different lists (Watching, Completed, Plan to Watch, Dropped)
- **User Authentication**: Sign up, sign in, and manage your profile
- **Movie Discovery**: Browse and search popular movies
- **Rating System**: Rate movies on a 5-star scale
- **Personal Notes**: Add personal notes to your movies
- **Profile Management**: Edit your name and bio like Instagram

### User Interface
- **Movie-themed Design**: Netflix-inspired color scheme with modern aesthetics
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile
- **Smooth Animations**: Beautiful transitions, hover effects, and micro-interactions
- **Dark Theme**: Easy on the eyes with a sophisticated dark color palette
- **Modern UI Components**: Cards, buttons, forms with consistent styling and proper accessibility
- **Enhanced Form Design**: Improved input fields with better icon positioning and visual feedback

### Technical Features
- **TypeScript**: Full type safety throughout the application
- **React Hooks**: Custom hooks for authentication and movie management
- **Context API**: Global state management for user and movie data
- **React Router**: Client-side routing with protected routes
- **CSS Variables**: Consistent theming with CSS custom properties
- **Local Storage**: Persistent data storage for demo purposes

## 🚀 Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Trackd
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx     # Navigation header
│   └── MovieCard.tsx  # Movie display card
├── hooks/             # Custom React hooks
│   ├── useAuth.tsx    # Authentication context
│   └── useMovies.tsx  # Movie management context
├── pages/             # Page components
│   ├── Landing.tsx    # Landing page
│   ├── SignIn.tsx     # Sign in page
│   ├── SignUp.tsx     # Sign up page
│   ├── Home.tsx       # Dashboard/home page
│   ├── Profile.tsx    # User profile page
│   └── Discover.tsx  # Movie discovery page
├── types/             # TypeScript type definitions
│   └── index.ts       # Main type definitions
├── utils/             # Utility functions
│   ├── auth.ts        # Authentication utilities
│   └── movies.ts      # Movie management utilities
├── App.tsx            # Main app component
├── main.tsx           # App entry point
└── index.css          # Global styles and CSS variables
```

## 🎨 Design System

### Color Palette
- **Primary**: `#e50914` (Netflix red)
- **Secondary**: `#141414` (Dark background)
- **Accent**: `#f5c518` (Golden accent)
- **Success**: `#00d4aa` (Green)
- **Error**: `#e50914` (Red)
- **Warning**: `#f5c518` (Yellow)

### Typography
- **Font Family**: Inter, system fonts
- **Font Sizes**: Responsive scale from xs to 6xl
- **Line Heights**: Optimized for readability

### Spacing
- **Consistent spacing scale**: xs, sm, md, lg, xl, 2xl
- **Container max-width**: 1200px
- **Responsive padding**: Adapts to screen size

### CSS Architecture
- **CSS Custom Properties**: Centralized theming with CSS variables
- **Utility-First Approach**: Tailwind-inspired utility classes
- **Component-Based Styling**: Modular CSS for reusable components
- **Responsive Design**: Mobile-first responsive utilities

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎯 Key Features Explained

### Enhanced User Interface
Recent improvements include:
- **Interactive Landing Page**: Features a realistic movie dashboard mockup with animated elements
- **Improved Form Design**: Better input field styling with properly positioned icons and enhanced visual feedback
- **Modern Color System**: Updated color palette with CSS custom properties for consistent theming
- **Smooth Animations**: Enhanced micro-interactions and floating animations throughout the interface

### Authentication System
The app uses a mock authentication system that simulates real authentication:
- User registration and login with improved form validation
- Persistent sessions using localStorage
- Protected routes for authenticated users
- Profile management with editable name and bio

### Movie Management
- **Add Movies**: Discover and add movies from the discover page
- **Track Status**: Change movie status (Watching, Completed, etc.)
- **Rate Movies**: Give movies a 1-5 star rating
- **Add Notes**: Personal notes for each movie
- **Search & Filter**: Find movies by title, genre, or status

### Responsive Design
- Mobile-first approach
- Breakpoints for tablet and desktop
- Touch-friendly interactions
- Optimized layouts for all screen sizes

## 🎨 UI Components

### MovieCard
Interactive movie cards with:
- Movie poster with hover effects
- Status badges and ratings
- Quick status change dropdown
- Edit and remove actions
- Genre tags

### Header
Navigation header with:
- Logo and branding
- Navigation menu
- User profile dropdown
- Mobile-responsive menu

### Forms
Consistent form styling with:
- Input validation
- Error handling
- Loading states
- Icon integration

## 🔒 Security & Data

### Demo Mode
This is a demo application that uses:
- Local storage for data persistence
- Mock authentication (no real backend)
- Sample movie data
- Simulated API delays

### Data Structure
```typescript
interface Movie {
  id: string;
  title: string;
  overview: string;
  posterPath: string;
  releaseDate: string;
  voteAverage: number;
  genres: string[];
  status: 'watching' | 'completed' | 'plan_to_watch' | 'dropped';
  rating?: number;
  notes?: string;
}
```

## 🚀 Deployment

To deploy this application:

1. Build the project:
```bash
npm run build
```

2. The built files will be in the `dist` folder

3. Deploy to your preferred hosting service (Netlify, Vercel, etc.)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Movie data and images from TMDB
- Icons from Lucide React
- Design inspiration from Netflix and modern streaming platforms
- React and TypeScript communities for excellent documentation

---

**Note**: This is a demo application for educational purposes. For production use, you would need to implement a real backend API and database.
