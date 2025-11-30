# 🔐 Dashboard Sign-In Guide

## Quick Start

### Option 1: Setup Your Existing Clerk Account (Recommended)

1. **Sign In First**: Go to http://localhost:3000/sign-in
   - Use your Clerk admin credentials to sign in

2. **Add Your Role**: Go to http://localhost:3000/setup
   - Select your desired role (Admin, Teacher, Student, or Parent)
   - Click "Add Role & Access Dashboard"

3. **Access Dashboard**: 
   - Your role will be added to your Clerk account metadata
   - Refresh the page or sign out and back in
   - You'll now be redirected to your dashboard (e.g., `/admin`, `/teacher`, `/student`, `/parent`)

### Option 2: Create Test Users with Clerk

Run the setup script to create test users in Clerk:

```bash
node setup-clerk-users.js
```

This creates 4 test users:
- **Admin**: `admin1` / `Admin@123456`
- **Teacher**: `teacher1` / `Teacher@123456`
- **Student**: `student1` / `Student@123456`
- **Parent**: `parent1` / `Parent@123456`

### Option 3: Use API Endpoint Directly

Send a POST request to `/api/admin/setup` with your Clerk user ID:

```bash
curl -X POST http://localhost:3000/api/admin/setup \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_xxx",
    "role": "admin"
  }'
```

## Available Roles & Dashboards

| Role | URL | Access |
|------|-----|--------|
| **Admin** | `/admin` | Full system access, manage all data |
| **Teacher** | `/teacher` | Manage classes, lessons, grades |
| **Student** | `/student` | View assignments, results, attendance |
| **Parent** | `/parent` | Track student progress, view events |

## Dashboard Features by Role

### Admin Dashboard
- ✅ Manage Students, Teachers, Parents
- ✅ Create Classes, Subjects, Lessons
- ✅ Schedule Exams & Assignments
- ✅ View all analytics & reports
- ✅ System-wide event management

### Teacher Dashboard
- ✅ Manage assigned classes
- ✅ Create lessons and exams
- ✅ Grade assignments & exams
- ✅ Track student attendance
- ✅ Post announcements

### Student Dashboard
- ✅ View assigned classes
- ✅ Access assignments & exams
- ✅ Check grades & results
- ✅ View attendance records
- ✅ Read announcements

### Parent Dashboard
- ✅ Monitor student progress
- ✅ View attendance & grades
- ✅ Check assignments
- ✅ Read school announcements
- ✅ See events

## Troubleshooting

### "Couldn't find your account" Error
- Make sure you've signed in at `/sign-in` first
- Your account must exist in Clerk

### Can't access dashboard after adding role
- Try refreshing the page (F5)
- Sign out and sign back in
- Check browser console for errors

### API Setup Endpoint Returns 400
- Make sure `userId` and `role` are provided
- Role must be one of: `admin`, `teacher`, `student`, `parent`
- User ID should be your Clerk user ID (starts with `user_`)

## Database Info

The app uses **SQLite** for development:
- **Location**: `prisma/dev.db`
- **Pre-populated** with sample data for testing
- No external database server needed!

## Getting Your Clerk User ID

1. Sign in at http://localhost:3000/sign-in
2. Go to http://localhost:3000/setup
3. Your User ID is shown on the setup page
4. Or check Clerk dashboard: https://dashboard.clerk.com
