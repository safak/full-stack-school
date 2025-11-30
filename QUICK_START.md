# 🎯 Quick Start: Sign In to Dashboard

## 3 Simple Steps

### Step 1️⃣: Go to Sign In Page
Open in your browser:
```
http://localhost:3000/sign-in
```

### Step 2️⃣: Sign In with Your Clerk Account
Enter your **Clerk credentials**:
- Username/Email: Your Clerk admin account
- Password: Your Clerk password

### Step 3️⃣: Add Your Role
After signing in, you'll see a blue box with:
**"First time signing in? 👉 Click here to add your role →"**

Click the link or go directly to:
```
http://localhost:3000/setup
```

### Step 4️⃣: Select Your Role & Submit
- Choose your role: Admin, Teacher, Student, or Parent
- Click **"Add Role & Access Dashboard"**
- Refresh the page

✅ **You're in!** You should now see your dashboard.

---

## Common Issues & Solutions

### ❌ "Couldn't find your account"
**Solution:** 
- Make sure your Clerk admin account exists in Clerk dashboard
- Try signing up first if you haven't created an account

### ❌ "After adding role, page doesn't change"
**Solution:**
- Refresh the page (F5)
- Or sign out and sign back in
- Your role should now work

### ❌ Still can't access dashboard
**Solution:**
- Open browser DevTools (F12)
- Check Console for errors
- Try clearing browser cache (Ctrl+Shift+Del)

---

## Test Accounts (Optional)

If you want to test without your personal Clerk account, create test users:

```bash
node setup-clerk-users.js
```

**Test Login Credentials:**
- Admin: `admin1` / `Admin@123456`
- Teacher: `teacher1` / `Teacher@123456`
- Student: `student1` / `Student@123456`
- Parent: `parent1` / `Parent@123456`

---

## Dashboard Paths

Once logged in, you'll be at:
- **Admin**: `http://localhost:3000/admin`
- **Teacher**: `http://localhost:3000/teacher`
- **Student**: `http://localhost:3000/student`
- **Parent**: `http://localhost:3000/parent`

Each role has different permissions and features!

---

## Need More Help?

See the full guide: [SIGNIN_GUIDE.md](./SIGNIN_GUIDE.md)
