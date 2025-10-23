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
- **Smooth Animations**: Beautiful transitions, hover effects, sliding form animations
- **Dark Theme**: Easy on the eyes with a sophisticated dark color palette
- **Modern UI Components**: Cards, buttons, forms with consistent styling and proper accessibility
- **Multi-Step Signup**: Animated step-by-step registration process with progress indicator
- **Enhanced Form Design**: Custom validation, no browser warnings, improved UX
- **Component Architecture**: Modular, reusable components with clean separation of concerns

### Technical Features
- **TypeScript**: Full type safety throughout the application
- **React Hooks**: Custom hooks for authentication and movie management
- **Context API**: Global state management for user and movie data
- **React Router**: Client-side routing with protected routes
- **CSS Variables**: Consistent theming with CSS custom properties
- **Local Storage**: Persistent data storage for demo purposes
- **Component Refactoring**: Modular architecture with 60% code reduction
- **Form Animations**: Directional sliding transitions with CSS keyframes
- **Custom Validation**: Client-side validation without browser default warnings

## 🔄 Recent Improvements

### Code Refactoring (September 2025)
- **Component Modularization**: Broke down large components into smaller, reusable pieces
- **Code Reduction**: Achieved significant line reduction:
  - SignUp page: 454 → 165 lines (64% reduction)
  - Discover page: 345 → 55 lines (84% reduction)
  - CSS optimization: 1137 → ~450 lines (60% reduction)
- **Architecture Enhancement**: Implemented proper separation of concerns
- **Animation System**: Added comprehensive sliding animations for multi-step forms
- **Form UX**: Removed browser validation warnings for better user experience

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
├── components/                    # Reusable UI components
│   ├── common/                   # Shared common components
│   │   ├── Message.tsx          # Error/warning/success messages
│   │   ├── ProgressIndicator.tsx # Multi-step form progress
│   │   └── index.ts             # Barrel exports
│   ├── discover/                # Movie discovery components
│   │   ├── DiscoverMovieCard.tsx # Movie card for discovery
│   │   ├── MovieGrid.tsx        # Grid layout for movies
│   │   ├── SearchAndFilters.tsx # Search and filter controls
│   │   └── index.ts             # Barrel exports
│   ├── forms/                   # Form-related components
│   │   ├── EmailStep.tsx        # Multi-step signup: email step
│   │   ├── FormField.tsx        # Reusable form input field
│   │   ├── NameStep.tsx         # Multi-step signup: name step
│   │   ├── NavigationButtons.tsx # Form navigation controls
│   │   ├── PasswordStep.tsx     # Multi-step signup: password step
│   │   ├── StepHeader.tsx       # Step titles and descriptions
│   │   ├── StepTransition.tsx   # Animated step transitions
│   │   ├── UsernameStep.tsx     # Multi-step signup: username step
│   │   └── index.ts             # Barrel exports
│   ├── Header.tsx               # Navigation header
│   └── MovieCard.tsx            # Movie display card for tracking
├── hooks/                       # Custom React hooks
│   ├── forms/                   # Form-specific hooks
│   │   └── useMultiStepForm.tsx # Multi-step signup form logic
│   ├── useAuth.tsx              # Authentication context
│   ├── useDiscoverMovies.tsx    # Movie discovery API hooks
│   └── useMovies.tsx            # Movie management context
├── pages/                       # Page components
│   ├── Discover.tsx             # Movie discovery page (refactored)
│   ├── Home.tsx                 # Dashboard/home page
│   ├── Landing.tsx              # Landing page with hero section
│   ├── Profile.tsx              # User profile page
│   ├── SignIn.tsx               # Sign in page
│   └── SignUp.tsx               # Multi-step sign up page (refactored)
├── types/                       # TypeScript type definitions
│   └── index.ts                 # Main type definitions
├── utils/                       # Utility functions
│   ├── auth.ts                  # Authentication utilities
│   └── movies.ts                # Movie management utilities
├── App.tsx                      # Main app component with routing
├── main.tsx                     # App entry point
└── index.css                    # Global styles, CSS variables & animations
```

### Architecture Highlights

#### Component Organization
- **Modular Structure**: Components are organized by feature and responsibility
- **Barrel Exports**: Index files provide clean import paths
- **Separation of Concerns**: UI components separated from business logic
- **Reusable Components**: Shared components in `common/` folder

#### Form Architecture
- **Multi-Step Forms**: Sophisticated signup flow with step-by-step validation
- **Animated Transitions**: Smooth sliding animations between form steps
- **Custom Validation**: Client-side validation without browser defaults
- **Reusable Form Components**: Consistent form fields across the application

#### State Management
- **Context API**: Global authentication and movie state
- **Custom Hooks**: Encapsulated business logic and API interactions
- **Local Component State**: Form state and UI interactions
- **Persistent Storage**: localStorage for demo data persistence

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
