# Trackd - Project Directory Structure

```
Trackd/
├── .idea/                                    # IDE configuration
├── client/                                   # React Frontend Application
│   ├── public/
│   │   ├── logo.svg
│   │   └── sw.js                            # Service Worker
│   ├── src/
│   │   ├── assets/                          # Static assets
│   │   ├── components/                      # React Components
│   │   │   ├── skeletons/                   # Loading skeleton components
│   │   │   │   ├── FriendListItemSkeleton.tsx
│   │   │   │   ├── MovieCardSkeleton.tsx
│   │   │   │   ├── MovieGridSkeleton.tsx
│   │   │   │   ├── ProfileHeaderSkeleton.tsx
│   │   │   │   ├── SearchSuggestionSkeleton.tsx
│   │   │   │   ├── StatCardSkeleton.tsx
│   │   │   │   ├── UserCardSkeleton.tsx
│   │   │   │   └── index.ts
│   │   │   ├── types/                       # Component type definitions
│   │   │   ├── BottomNav.tsx
│   │   │   ├── ChangeEmail.tsx
│   │   │   ├── ChangePassword.tsx
│   │   │   ├── EditUserProfileModel.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ErrorAlert.tsx
│   │   │   ├── Feed.tsx
│   │   │   ├── GoogleLoginButton.tsx
│   │   │   ├── GuestRoute.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── MovieCard.tsx
│   │   │   ├── MovieCardWithDetails.tsx
│   │   │   ├── MovieInfoModel.tsx
│   │   │   ├── MovieSearchItem.tsx
│   │   │   ├── MutualFriends.tsx
│   │   │   ├── MutualFriendsCount.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── Notifications.tsx
│   │   │   ├── Portal.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── RequestChangeEmail.tsx
│   │   │   ├── SearchDropdown.tsx
│   │   │   ├── StarRating.tsx
│   │   │   ├── StatCard.tsx
│   │   │   ├── SuccessAlert.tsx
│   │   │   └── TrendingMoviesSection.tsx
│   │   ├── config/
│   │   │   └── api.config.ts                # API configuration
│   │   ├── constants/
│   │   │   ├── search.ts
│   │   │   └── tmdb.ts                      # TMDB API constants
│   │   ├── hooks/                           # Custom React Hooks
│   │   │   ├── useClickOutside.ts
│   │   │   ├── useDebounce.ts
│   │   │   ├── useDetectCountry.ts
│   │   │   ├── useKeyboardHandler.ts
│   │   │   ├── useTokenRefreshOnLoad.ts
│   │   │   └── useWebSocket.tsx             # WebSocket hook for real-time notifications
│   │   ├── pages/                           # Page Components
│   │   │   ├── DiscoverPage.tsx
│   │   │   ├── FindUsers.tsx
│   │   │   ├── ForgetPassword.tsx
│   │   │   ├── Home.tsx
│   │   │   ├── LandingPage.tsx
│   │   │   ├── MyListPage.tsx
│   │   │   ├── NotFoundPage.tsx
│   │   │   ├── OauthSuccessPage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   ├── ResetPassword.tsx
│   │   │   ├── SettingsPage.tsx
│   │   │   ├── SigninPage.tsx
│   │   │   ├── SignupPage.tsx
│   │   │   └── userPage.tsx
│   │   ├── redux/                           # Redux State Management
│   │   │   ├── auth/
│   │   │   │   ├── authApi.ts               # Auth API endpoints
│   │   │   │   └── authSlice.ts             # Auth state slice
│   │   │   ├── friend/
│   │   │   │   └── friendApi.ts             # Friend API endpoints
│   │   │   ├── movie/
│   │   │   │   └── movieApi.ts              # Movie API endpoints
│   │   │   ├── notification/
│   │   │   │   └── notificationApi.ts       # Notification API endpoints
│   │   │   ├── user/
│   │   │   │   ├── userApi.ts               # User API endpoints
│   │   │   │   └── userSlice.ts             # User state slice
│   │   │   ├── userMovie/
│   │   │   │   └── userMovieApi.ts          # User Movie API endpoints
│   │   │   ├── apiSlice.ts                  # RTK Query API slice
│   │   │   ├── baseQuery.ts                 # Base query configuration
│   │   │   └── store.ts                     # Redux store configuration
│   │   ├── styles/
│   │   │   └── custom.css
│   │   ├── utils/                           # Utility functions
│   │   │   ├── Types.ts
│   │   │   ├── config.ts
│   │   │   ├── logger.ts
│   │   │   ├── redirect.ts
│   │   │   ├── tokenManager.ts
│   │   │   └── validation.ts
│   │   ├── App.css
│   │   ├── App.tsx
│   │   └── main.tsx                         # Application entry point
│   ├── .dockerignore
│   ├── .env
│   ├── .env.docker
│   ├── .env.example
│   ├── Dockerfile.dev
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── tailwind.config.ts                   # Tailwind CSS configuration
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vercel.json                          # Vercel deployment config
│   └── vite.config.ts                       # Vite configuration
│
├── server/                                   # NestJS Backend Application
│   ├── prisma/
│   │   ├── migrations/                      # Database migrations
│   │   │   ├── 20251101045012_init/
│   │   │   ├── 20251105051114_added_tables_movie_user_movie_data_lists_lists_entry_tags_tags_entry/
│   │   │   ├── 20251105075221_removed_autoincrement_id_from_movies_table/
│   │   │   ├── 20251105111458_removed_list_and_tag_models/
│   │   │   ├── 20251105112606_improved_relations/
│   │   │   ├── 20251118155715_add_friendship_system/
│   │   │   ├── 20251119101126_added_cuid_instead_of_autoincrement/
│   │   │   ├── 20251121081118_added_username_column_for_users/
│   │   │   ├── 20251127134538_made_username_required_column/
│   │   │   ├── 20251128112928_add_unique_friend_pair_index/
│   │   │   ├── 20251129063526_added_frindcount_in_user_table/
│   │   │   ├── 20251130083354_add_column_in_user_table_to_track_password_change_time/
│   │   │   ├── 20251202161153_added_reset_password_token_column_to_user_table/
│   │   │   ├── 20251202162459_removed_reset_password_token_col_from_user_insted_added_a_table/
│   │   │   ├── 20251203114018_added_bio_column_to_user_table/
│   │   │   ├── 20251204085750_added_a_email_change_table/
│   │   │   ├── 20251204114031_made_token_column_unique_in_email_change_table/
│   │   │   ├── 20251207091558_add_google_auth/
│   │   │   ├── 20251226195809_add_notifications/
│   │   │   └── migration_lock.toml
│   │   ├── schema.prisma                    # Prisma schema definition
│   │   └── seed.ts                          # Database seed script
│   ├── scripts/
│   │   ├── generate-env-example.ts
│   │   └── test-email.ts
│   ├── src/
│   │   ├── common/                          # Shared utilities
│   │   │   ├── filters/
│   │   │   │   └── AllExceptionsFilter.ts   # Global exception filter
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts            # Authentication guard
│   │   │   │   └── optionalAuth.guard.ts    # Optional auth guard
│   │   │   └── pipes/
│   │   ├── config/
│   │   │   └── tmdb.config.ts               # TMDB API configuration
│   │   ├── modules/                         # Feature Modules
│   │   │   ├── auth/
│   │   │   │   ├── DTO/
│   │   │   │   │   ├── login.dto.ts
│   │   │   │   │   └── register.dto.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.utils.ts
│   │   │   │   └── jwt.service.ts
│   │   │   ├── friend/
│   │   │   │   ├── DTO/
│   │   │   │   │   └── friend.dto.ts
│   │   │   │   ├── friend.controller.ts
│   │   │   │   ├── friend.module.ts
│   │   │   │   └── friend.service.ts
│   │   │   ├── movie/
│   │   │   │   ├── DTO/
│   │   │   │   │   └── movie.dto.ts
│   │   │   │   ├── movie.controller.ts
│   │   │   │   ├── movie.module.ts
│   │   │   │   ├── movie.services.ts
│   │   │   │   └── tmdb.service.ts
│   │   │   ├── notification/
│   │   │   │   ├── notification.controller.ts
│   │   │   │   ├── notification.gateway.ts  # WebSocket gateway
│   │   │   │   ├── notification.module.ts
│   │   │   │   └── notification.service.ts
│   │   │   ├── prisma/
│   │   │   │   ├── prisma.module.ts
│   │   │   │   └── prisma.service.ts
│   │   │   ├── user/
│   │   │   │   ├── user.controller.ts
│   │   │   │   ├── user.dto.ts
│   │   │   │   ├── user.module.ts
│   │   │   │   ├── user.service.ts
│   │   │   │   └── users.controller.ts
│   │   │   └── user-movie/
│   │   │       ├── DTO/
│   │   │       │   └── user-movie.dto.ts
│   │   │       ├── user-movie.controller.ts
│   │   │       ├── user-movie.module.ts
│   │   │       └── user-movie.service.ts
│   │   ├── utils/                           # Utility functions
│   │   │   ├── constants.ts
│   │   │   ├── cookie.ts                    # HTTP-only cookie utilities
│   │   │   ├── email.ts                     # Email service
│   │   │   ├── emailTemplates.ts            # Email templates
│   │   │   ├── env-validator.ts             # Environment validation
│   │   │   └── otp.ts                       # OTP generation/validation
│   │   ├── app.controller.ts
│   │   ├── app.module.ts
│   │   ├── app.service.ts
│   │   └── main.ts                          # Application entry point
│   ├── .dockerignore
│   ├── .env
│   ├── .env.docker
│   ├── .env.example
│   ├── .env.production.example
│   ├── .prettierrc
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   ├── eslint.config.mjs
│   ├── nest-cli.json
│   ├── package-lock.json
│   ├── package.json
│   ├── prisma.config.ts
│   ├── tsconfig.build.json
│   └── tsconfig.json
│
├── docs/                                     # Documentation
│   ├── GOOGLE_OAUTH_SETUP.md
│   ├── OAUTH_IMPLEMENTATION_SUMMARY.md
│   └── OAUTH_QUICK_REFERENCE.md
│
├── .DS_Store
├── README.md
├── docker-compose.dev.yml                    # Development Docker compose
├── docker-compose.yml                        # Production Docker compose
└── todo.txt
```

## Key Features by Directory

### Frontend (client/)
- **Authentication**: JWT-based auth with refresh token rotation
- **State Management**: Redux Toolkit with RTK Query
- **Real-time**: WebSocket integration for live notifications
- **UI**: Tailwind CSS with responsive design (mobile & desktop)
- **Routing**: Protected routes, guest routes, and optional auth routes

### Backend (server/)
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens with HTTP-only cookies
- **Real-time**: Socket.IO for WebSocket notifications
- **Features**:
  - User authentication (email/password + Google OAuth)
  - Friend system (follow/unfollow, friend requests)
  - Movie tracking (watch status, ratings)
  - Notifications (real-time via WebSocket)
  - Rate limiting
  - Email service (OTP, password reset)

### Database Migrations
The project uses Prisma migrations with a comprehensive history showing:
- User management with social features
- Movie tracking system
- Friendship/follow system
- Notification system
- Authentication improvements (OAuth, password reset)
- CUID-based IDs instead of auto-increment

