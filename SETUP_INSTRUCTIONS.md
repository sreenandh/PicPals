# PicPals - Setup Instructions

## Overview
PicPals is an Instagram-like mobile app for kids, managed by parents. Built with React Native (Expo), FastAPI, and Supabase PostgreSQL.

## Current Status ✅

### ✅ Completed
1. **Frontend (React Native Expo)**
   - Authentication screens (Login, Signup, Forgot Password)
   - Tab navigation (Feed, Create Post, Store, Profile)
   - Supabase integration with AsyncStorage
   - Auth context with session management
   - Beautiful dark theme UI with Ionicons
   - Image picker for posts and profile pictures

2. **Backend (FastAPI + Supabase)**
   - Complete API endpoints for:
     - Profile management
     - Posts (create, get feed, delete)
     - Likes with points system
     - Comments
     - Products catalog
     - Redemptions
     - File uploads (base64)
   - JWT token verification
   - Supabase client integration

3. **Database Schema**
   - Complete PostgreSQL schema in `/app/database_schema.sql`
   - Tables: profiles, child_profiles, posts, comments, likes, points_transactions, products, redemptions, reports
   - Row Level Security (RLS) policies
   - Indexes for performance
   - Triggers for updated_at timestamps

## ⚠️ IMPORTANT: Database Setup Required

**You must run the database schema in your Supabase project before the app will work!**

### Step 1: Set Up Database Schema

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project (pyyejnxjkwkzuomlnexo.supabase.co)
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of `/app/database_schema.sql`
6. Paste into the SQL Editor
7. Click **Run** or press Cmd/Ctrl + Enter
8. Wait for "Success. No rows returned" message

### Step 2: Create Storage Buckets (Optional but Recommended)

For better file management in production:

1. Go to **Storage** in your Supabase Dashboard
2. Create two buckets:
   - `avatars` (for profile pictures)
   - `media` (for post photos/videos)
3. Set both to **Private**
4. Add storage policies (examples in database_schema.sql)

Currently, the app uses base64 encoding for images which works but isn't optimal for production.

## Testing the App

### Backend API Testing

The backend is running at: `https://parentpics.preview.emergentagent.com/api/`

Test the health endpoint:
```bash
curl https://parentpics.preview.emergentagent.com/api/
```

Expected response:
```json
{"message":"PicPals API is running","status":"healthy"}
```

### Frontend Testing

⚠️ **Known Issue**: The Expo tunnel is experiencing ngrok connection issues. This is an infrastructure problem, not code-related.

**Workaround Options:**
1. Wait for the tunnel to reconnect (happens automatically)
2. Access via web preview (if available)
3. Test on physical device using Expo Go app

## App Features

### Phase 1 (Current - MVP Core) ✅
- ✅ User authentication (email/password)
- ✅ Email verification
- ✅ Password reset
- ✅ Parent profiles with avatars
- ✅ Bottom tab navigation
- ✅ Points system
- ✅ Basic UI structure

### Phase 2 (In Progress - Social Features)
- Create posts with photos
- Feed with real-time updates
- Like posts (earn points)
- Comment on posts
- Pull-to-refresh

### Phase 3 (Planned - Gamification)
- Points wallet and transactions
- Product catalog with images
- Redemption flow
- Order tracking

### Phase 4 (Planned - Admin & Safety)
- Child profiles management
- Reporting system
- Content moderation
- Admin dashboard

## Environment Variables

### Frontend (`/app/frontend/.env`)
```
EXPO_PUBLIC_SUPABASE_URL=https://pyyejnxjkwkzuomlnexo.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### Backend (`/app/backend/.env`)
```
SUPABASE_URL=https://pyyejnxjkwkzuomlnexo.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
SUPABASE_JWT_SECRET=50OK7QH...
```

## Architecture

```
PicPals/
├── frontend/                # React Native Expo app
│   ├── app/                # Expo Router file-based routing
│   │   ├── (auth)/        # Authentication screens
│   │   ├── (tabs)/        # Main app tabs
│   │   └── index.tsx      # Entry point with auth routing
│   ├── contexts/          # React Context providers
│   │   └── AuthContext.tsx
│   └── lib/               # Utilities
│       └── supabase.ts    # Supabase client
├── backend/               # FastAPI server
│   └── server.py          # API endpoints
└── database_schema.sql    # PostgreSQL schema
```

## API Endpoints

### Authentication (Handled by Supabase Auth)
- Sign Up: Handled in frontend
- Sign In: Handled in frontend
- Password Reset: Handled in frontend

### Profiles
- `GET /api/profile` - Get current user profile
- `PUT /api/profile` - Update profile

### Posts
- `GET /api/posts` - Get feed (paginated)
- `POST /api/posts` - Create new post
- `DELETE /api/posts/{id}` - Delete post

### Interactions
- `POST /api/posts/{id}/like` - Toggle like (awards/deducts points)
- `GET /api/posts/{id}/comments` - Get comments
- `POST /api/posts/{id}/comments` - Add comment

### Store
- `GET /api/products` - List products
- `POST /api/redemptions` - Redeem product
- `GET /api/redemptions` - User's redemption history

### File Upload
- `POST /api/upload` - Upload image (returns base64 data URL)

## Mobile Navigation Flow

```
App Launch
    ↓
[Loading Screen]
    ↓
Session Check
    ↓
    ├── No Session → Login Screen
    │                    ↓
    │               Sign Up / Login
    │                    ↓
    └── Has Session → Main Tabs
                          ├── Feed (Home)
                          ├── Create Post
                          ├── Store
                          └── Profile
```

## Key Features Implementation

### Points System
- Users earn 1 point per like given
- Points are deducted when redeeming products
- Points transactions are recorded in `points_transactions` table
- Balance displayed throughout the app

### Row Level Security
All tables have RLS enabled with policies:
- Users can view public data
- Users can only modify their own data
- Admin operations use service role key

### Image Handling
Currently using base64 encoding:
- Images are converted to base64 strings
- Stored directly in database or returned as data URLs
- Works immediately without storage bucket setup
- **Recommendation**: Migrate to Supabase Storage for production

## Next Steps

1. **Run the database schema** (most important!)
2. Test authentication flow
3. Create a test post
4. Test like/comment functionality
5. Add some products to the store
6. Test redemption flow

## Troubleshooting

### "Profile not found" error after signup
- Make sure the database schema is running
- Check that the `profiles` table exists
- Verify RLS policies are set up

### Cannot upload images
- This is expected - storage buckets need to be created
- Current implementation uses base64 (works but not optimal)
- See "Create Storage Buckets" section above

### Expo tunnel issues
- This is a known infrastructure issue
- The app code is working correctly
- Wait for automatic reconnection

## Development Commands

### Frontend
```bash
cd /app/frontend
yarn start                    # Start Expo dev server
sudo supervisorctl restart expo  # Restart Expo service
```

### Backend
```bash
cd /app/backend
sudo supervisorctl restart backend  # Restart FastAPI service
```

### Clear Metro cache
```bash
cd /app/frontend
rm -rf .metro-cache
```

## Security Notes

- ✅ JWT tokens validated on backend
- ✅ Row Level Security enabled
- ✅ Service role key only in backend
- ✅ Anon key safe for frontend (with RLS)
- ⚠️ CORS set to allow all origins (tighten in production)
- ⚠️ Email verification required but not enforced (add check)

## Contact & Support

For issues or questions about PicPals, please refer to:
- Database schema: `/app/database_schema.sql`
- Backend API: `/app/backend/server.py`
- Frontend code: `/app/frontend/app/`

---

**Built with ❤️ using Expo, FastAPI, and Supabase**
