# 🎉 PicPals - Instagram for Kids, Managed by Parents

<div align="center">

![PicPals](https://img.shields.io/badge/Platform-iOS%20%7C%20Android-blue)
![React Native](https://img.shields.io/badge/React%20Native-0.79-61DAFB?logo=react)
![Expo](https://img.shields.io/badge/Expo-54-000020?logo=expo)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?logo=fastapi)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)

A safe, kid-friendly social media app where parents share photos & reels, earn points through engagement, and redeem rewards for baby products.

[Features](#-features) • [Quick Start](#-quick-start) • [Setup Guide](SETUP_GUIDE.md) • [Tech Stack](#-tech-stack)

</div>

---

## 🎯 Features

### ✅ Implemented (75% Complete)

- **🔐 Authentication**
  - Email/password sign up with verification
  - Login and password reset
  - JWT token-based auth

- **👤 Profile Management**
  - User profiles with avatars
  - Bio and username customization
  - Points balance display

- **📸 Create Posts**
  - Upload photos from gallery or camera
  - Add captions
  - Supabase Storage integration
  - Earn 5 points per post

- **📱 Feed**
  - Beautiful post cards with user info
  - Like posts (earn 1 point)
  - Unlike functionality
  - Comment button
  - Report inappropriate content
  - Pull to refresh
  - Infinite scroll pagination

- **🏭 Rewards Store**
  - Browse baby products
  - Points-based redemption system
  - Shipping address input
  - Stock management
  - Order tracking

- **⭐ Points System**
  - Create post: +5 points
  - Like a post: +1 point
  - Redeem products: -points cost
  - Transaction history

### ⚠️ Partial

- **💬 Comments** - UI ready, needs full implementation
- **👶 Child Profiles** - Database ready, needs UI

### ❌ Not Yet Implemented

- 🎥 Video/Reels support
- 🛡️ Admin web panel
- 🔔 Push notifications
- 📧 Email notifications
- 🚫 Content moderation UI

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Expo Go app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
- Supabase account ([sign up free](https://supabase.com))

### 1. Database Setup

```bash
# Go to Supabase Dashboard -> SQL Editor
# Run the database_schema.sql file
# Create storage buckets: 'media' and 'avatars'
```

**Add sample products:**
```sql
INSERT INTO products (name, description, points_cost, quantity_available) VALUES
('Baby Diaper Pack', 'Premium diapers - 50 pack', 100, 10, true),
('Baby Wipes', 'Gentle wipes - 80 sheets', 50, 20, true),
('Toy Set', 'Educational toys', 200, 5, true);
```

### 2. Frontend Setup

```bash
# Clone and install
git clone https://github.com/sreenandh/PicPals.git
cd PicPals/frontend
npm install

# Create .env file
cat > .env << EOF
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EOF

# Start Expo
npx expo start
```

### 3. Test on Expo Go

1. Open Expo Go app on your phone
2. Scan the QR code from terminal
3. Sign up and start using! 🎉

**Full setup guide:** [SETUP_GUIDE.md](SETUP_GUIDE.md)

---

## 📸 Screenshots

### User Flow
```
Sign Up → Verify Email → Login → Create Profile → Create Post → View Feed → Like Posts → Earn Points → Redeem Rewards
```

### Key Screens
- **Authentication:** Sign up, Login, Forgot Password
- **Feed:** Post cards with likes, comments, points
- **Create:** Photo upload with caption
- **Store:** Product catalogue with redemption
- **Profile:** User info, points, avatar

---

## 🛠️ Tech Stack

### Frontend
- **React Native** - Cross-platform mobile framework
- **Expo** - Development and build tooling
- **TypeScript** - Type-safe JavaScript
- **Expo Router** - File-based navigation
- **Supabase JS** - Database client

### Backend
- **FastAPI** - Modern Python API framework (optional, direct Supabase integration)
- **Supabase** - PostgreSQL database, auth, storage
- **Row Level Security** - Database-level authorization

### Database
- **PostgreSQL** - Relational database via Supabase
- **Supabase Storage** - Image and media hosting

---

## 💾 Project Structure

```
PicPals/
├── frontend/                    # React Native Expo app
│   ├── app/                       # Expo Router pages
│   │   ├── (auth)/                # Auth screens
│   │   │   ├── login.tsx
│   │   │   ├── signup.tsx
│   │   │   └── forgot-password.tsx
│   │   ├── (tabs)/                # Main app tabs
│   │   │   ├── feed.tsx           # Post feed
│   │   │   ├── create.tsx         # Create post
│   │   │   ├── store.tsx          # Rewards store
│   │   │   └── profile.tsx        # User profile
│   │   └── index.tsx              # App entry point
│   ├── components/                # Reusable components
│   │   ├── PostCard.tsx
│   │   └── ProductCard.tsx
│   ├── contexts/                  # React Context providers
│   │   └── AuthContext.tsx
│   └── lib/                       # Utilities
│       └── supabase.ts            # Supabase client
├── backend/                     # FastAPI server (optional)
│   └── server.py                  # API endpoints
├── database_schema.sql          # PostgreSQL schema
└── SETUP_GUIDE.md               # Detailed setup instructions
```

---

## 🧑‍💻 Development

### Running Locally

```bash
# Frontend
cd frontend
npm install
npx expo start

# Press 'i' for iOS simulator
# Press 'a' for Android emulator
# Scan QR code for physical device
```

### Clear Cache

```bash
cd frontend
rm -rf .metro-cache
rm -rf node_modules
npm install
npx expo start -c
```

---

## 📦 Database Schema

### Core Tables
- **profiles** - User profiles with points
- **child_profiles** - Child information
- **posts** - User posts with media
- **likes** - Post likes
- **comments** - Post comments with nesting
- **products** - Reward store items
- **redemptions** - User redemptions
- **points_transactions** - Points history
- **reports** - Content moderation

### Security
- Row Level Security (RLS) enabled
- Users can only modify their own data
- Public content readable by all authenticated users

---

## ✅ Testing

### Manual Testing Checklist

- [ ] Sign up with email/password
- [ ] Verify email
- [ ] Login
- [ ] Upload profile picture
- [ ] Create a post with photo
- [ ] See post in feed
- [ ] Like a post
- [ ] Check points increased
- [ ] Browse store products
- [ ] Redeem a product
- [ ] Check points deducted

---

## 🛡️ Safety & Privacy

- **Parent-only accounts** - Email verification required
- **No public child data** - Child profiles stored separately
- **Content reporting** - Users can report inappropriate content
- **Row Level Security** - Database-level authorization
- **Secure storage** - Images stored in private buckets

---

## 📈 Roadmap

### Phase 1: Core Features (75% ✅)
- [x] Authentication
- [x] Profile management
- [x] Create posts
- [x] Feed with likes
- [x] Points system
- [x] Rewards store

### Phase 2: Enhanced Social (25%)
- [ ] Comments implementation
- [ ] Video/Reels support
- [ ] Child profiles UI
- [ ] Notifications

### Phase 3: Admin & Safety (0%)
- [ ] Admin web panel
- [ ] Content moderation
- [ ] Analytics dashboard
- [ ] User management

### Phase 4: Polish (0%)
- [ ] Performance optimization
- [ ] Error boundaries
- [ ] Comprehensive testing
- [ ] App store deployment

---

## 📝 License

This project is for educational and portfolio purposes.

---

## 📧 Contact

**Developer:** Sreenandh M

**GitHub:** [@sreenandh](https://github.com/sreenandh)

---

## 👏 Acknowledgments

- Built with Expo and React Native
- Powered by Supabase
- Icons by Ionicons
- UI inspired by modern social media design

---

<div align="center">

**Built with ❤️ for families and kids**

PicPals v1.0 | 2025

[Get Started](SETUP_GUIDE.md) • [Report Issue](https://github.com/sreenandh/PicPals/issues)

</div>
