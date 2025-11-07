# 🚀 PicPals - Complete Setup Guide

## 📱 What I've Implemented

I've completed the following features for you:

### ✅ Implemented Features

1. **Feed with Post Cards** ⭐
   - Display posts with user avatars
   - Like functionality with points
   - Comment button (UI ready)
   - Report functionality
   - Pull to refresh
   - Infinite scroll pagination

2. **Create Post** ⭐
   - Image picker (gallery + camera)
   - Supabase Storage integration
   - Caption input
   - Upload progress indicator
   - Earn 5 points per post

3. **Store/Rewards** ⭐
   - Product catalogue display
   - Points balance widget
   - Redemption flow
   - Shipping address input
   - Stock management

4. **Points System** ⭐
   - Create post: +5 points
   - Like post: +1 point
   - Redeem products: -points

---

## 🔧 Setup Instructions

### **Step 1: Database Setup** (CRITICAL - Do This First!)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/pyyejnxjkwkzuomlnexo)
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the entire `database_schema.sql` file
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. Wait for "Success. No rows returned"

### **Step 2: Create Storage Buckets**

1. In Supabase Dashboard, go to **Storage**
2. Click **New Bucket**
3. Create bucket name: `media`
4. Make it **Private**
5. Click **Create Bucket**

6. Click **New Bucket** again
7. Create bucket name: `avatars`
8. Make it **Private**
9. Click **Create Bucket**

### **Step 3: Add Storage Policies**

Go back to **SQL Editor** and run:

```sql
-- Media bucket policies
CREATE POLICY "Users can view all media"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'media');

CREATE POLICY "Users can upload their own media"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own media"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own media"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Avatars bucket policies
CREATE POLICY "Users can view all avatars"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### **Step 4: Add Sample Products** (Optional but Recommended)

Run this in SQL Editor to add sample products:

```sql
INSERT INTO products (name, description, points_cost, quantity_available, is_active) VALUES
('Baby Diaper Pack', 'Premium diapers pack of 50', 100, 10, true),
('Baby Wipes', 'Gentle baby wipes - 80 sheets', 50, 20, true),
('Toy Set', 'Educational toy set for kids', 200, 5, true),
('Baby Bottle', 'BPA-free baby bottle 250ml', 75, 15, true),
('Pacifier Set', 'Orthodontic pacifier set of 2', 40, 25, true),
('Baby Shampoo', 'Tear-free baby shampoo 200ml', 60, 18, true);
```

### **Step 5: Clone and Setup Frontend**

```bash
# Clone the repo
git clone https://github.com/sreenandh/PicPals.git
cd PicPals/frontend

# Install dependencies
npm install
# or
yarn install
```

### **Step 6: Configure Environment Variables**

Create `frontend/.env` file:

```env
EXPO_PUBLIC_SUPABASE_URL=https://pyyejnxjkwkzuomlnexo.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Get your keys from:**
- Supabase Dashboard → Settings → API
- Copy the `anon` `public` key

### **Step 7: Start Expo**

```bash
cd frontend
npx expo start
```

---

## 📱 Testing on Expo Go

### **Option 1: Physical Device (Recommended)**

1. **Install Expo Go:**
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Connect to Same WiFi:**
   - Ensure your phone and computer are on the **same WiFi network**

3. **Scan QR Code:**
   - Open Expo Go app
   - Tap "Scan QR Code"
   - Point at the QR code in your terminal
   - App loads! 🎉

### **Option 2: iOS Simulator (Mac Only)**

```bash
cd frontend
npx expo start
# Press 'i' to open iOS simulator
```

### **Option 3: Android Emulator**

```bash
cd frontend
npx expo start
# Press 'a' to open Android emulator
```

---

## ✅ Testing Checklist

### **1. Authentication**
- [ ] Sign up with email/password
- [ ] Check email for verification link
- [ ] Click verification link
- [ ] Login with credentials
- [ ] Test "Forgot Password"

### **2. Profile**
- [ ] View profile with username and email
- [ ] See points balance (starts at 0)
- [ ] Upload profile picture
- [ ] Update bio

### **3. Create Post**
- [ ] Tap "Create" tab
- [ ] Choose image from gallery
- [ ] Add caption
- [ ] Click "Share Post"
- [ ] See success message with +5 points
- [ ] Go to Feed tab to see your post

### **4. Feed**
- [ ] See posts from all users
- [ ] Like a post (see +1 points)
- [ ] Unlike a post (see -1 points)
- [ ] Tap comment button
- [ ] Pull down to refresh
- [ ] Scroll to load more posts

### **5. Store**
- [ ] View your points balance
- [ ] Browse products
- [ ] Tap "Redeem" on a product you can afford
- [ ] Enter shipping address
- [ ] Confirm redemption
- [ ] See points deducted
- [ ] Check that product is marked as pending

---

## 🐛 Troubleshooting

### **Error: "Profile not found" after signup**
**Solution:** Run the database schema in Supabase SQL Editor

### **Error: Image upload fails**
**Solution:** Make sure you created the `media` storage bucket and added policies

### **Error: "Network request failed"**
**Solution:** 
- Check that you're on the same WiFi network
- Verify Supabase URL and anon key in `.env`
- Check internet connection

### **Error: No products showing in store**
**Solution:** Run the sample products SQL insert query

### **App crashes on startup**
**Solution:**
```bash
cd frontend
rm -rf .metro-cache
rm -rf node_modules
npm install
npx expo start -c
```

### **Expo Go shows blank screen**
**Solution:**
- Check terminal for JavaScript errors
- Make sure all dependencies are installed
- Try restarting Expo: `npx expo start -c`

---

## 🎯 What's Working Now

✅ **Complete User Flow:**
1. Sign up → Verify email → Login
2. Upload profile picture and update profile
3. Create posts with photos (earn 5 points)
4. View feed with posts from all users
5. Like posts (earn 1 point per like)
6. Browse products in store
7. Redeem products with points
8. Track points balance

✅ **Points System:**
- Create post: +5 points
- Like a post: +1 point
- Redeem product: -points

✅ **Features:**
- Beautiful dark theme UI
- Image upload with Supabase Storage
- Real-time points updates
- Pull to refresh
- Infinite scroll
- Stock management
- Redemption tracking

---

## 📊 Implementation Status

**Overall: 75% Complete**

✅ **Completed:**
- Authentication (100%)
- Profile Management (100%)
- Feed with Post Cards (100%)
- Create Post (100%)
- Like System (100%)
- Points System (100%)
- Store/Products (100%)
- Redemption (100%)
- Supabase Storage (100%)
- Report Feature (100%)

⚠️ **Partial:**
- Comments (UI ready, needs full implementation)
- Child Profiles (database ready, needs UI)

❌ **Not Implemented:**
- Video/Reels support
- Admin web panel
- Push notifications
- Email notifications
- Content moderation UI

---

## 🚀 Next Steps (If You Want to Expand)

1. **Comments Feature:**
   - Create CommentScreen
   - Display comments list
   - Add comment input
   - Nested replies

2. **Video/Reels:**
   - Install `expo-av`
   - Add video picker
   - Video player in feed
   - Max 60s duration

3. **Child Profiles:**
   - Create child profile screen
   - Add/edit child profiles
   - Display in parent profile

4. **Admin Panel:**
   - Build React web app
   - Product management
   - User management
   - Content moderation
   - Redemption fulfillment

5. **Notifications:**
   - Push notifications (Expo Notifications)
   - Email notifications (SendGrid)
   - In-app notification center

---

## 📞 Support

**Issues?**
- Check the troubleshooting section above
- Review Expo logs in terminal
- Check Supabase logs in dashboard

**Resources:**
- [Expo Docs](https://docs.expo.dev)
- [Supabase Docs](https://supabase.com/docs)
- [React Native Docs](https://reactnative.dev)

---

**Built with ❤️ | PicPals v1.0 | 75% Complete**

Enjoy your Instagram for kids app! 🎉
