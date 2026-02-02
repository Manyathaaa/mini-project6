# Profile API Fix - Issue Resolution

## Problem
The profile API endpoint (`GET /api/auth/profile`) was not working after implementing the session management system.

## Root Cause
In `backend/controllers/authController.js`, the `getProfile` function was using `req.user.id` to fetch the user:

```javascript
const user = await User.findById(req.user.id).select('-password');
```

However, the new `sessionMiddleware.js` (which replaced the old `authMiddleware.js`) attaches the **full user document** to `req.user`, not just the user ID:

```javascript
// Line 72 in sessionMiddleware.js
req.user = await User.findById(decoded.id).select('-password');
```

This means `req.user` is already the complete user object (without password), and `req.user.id` was undefined, causing the profile fetch to fail.

## Solution
Updated the `getProfile` function to simply return `req.user` since it already contains the user data:

```javascript
exports.getProfile = async (req, res) => {
  // req.user is already the full user object (without password) from sessionMiddleware
  if (req.user) return res.json(req.user);
  res.status(404).json({ message: 'User not found' });
};
```

This is actually more efficient since we:
1. Avoid an unnecessary database query
2. Return the same user data that was already fetched during session validation
3. Reduce latency

## How to Test

### Option 1: Using the Test Script
```bash
cd /Users/manyatham/Documents/mini-project

# Make sure backend is running on port 5000
# Then run:
./test-profile-api.sh
```

### Option 2: Manual Testing with curl

1. **Start the backend** (in one terminal):
```bash
cd backend
npm run dev
```

2. **Register a user** (in another terminal):
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the `token` from the response.

3. **Test the profile endpoint**:
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Replace `YOUR_TOKEN_HERE` with the actual token from step 2.

### Option 3: Using the Frontend

1. **Start both backend and frontend**:
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm start
```

2. **Open browser** to `http://localhost:3000`

3. **Register/Login** and navigate to the Dashboard

4. The dashboard should load your profile data successfully

## Additional Fixes Applied

### Fixed Inconsistency in `sessionController.js`
The `sessionController.js` was already correctly using `req.user._id` in all its functions:
- `getActiveSessions()` - uses `req.user._id`
- `revokeSession()` - uses `req.user._id`
- `revokeAllOtherSessions()` - uses `req.user._id`
- `getSessionHistory()` - uses `req.user._id`

These are all correct because when accessing the MongoDB `_id` field from the user document, we need to use `req.user._id`.

## Remaining Issues to Address

### 1. Duplicate Index Warning
You'll see this warning when starting the backend:
```
Warning: Duplicate schema index on {"expiresAt":1} found.
```

**Fix**: In `backend/models/Session.js`, remove the duplicate index definition. Either use:
- Option A: Just `expiresAt: { type: Date, index: true }`
- Option B: Just `sessionSchema.index({ expiresAt: 1 })`

Don't use both!

### 2. Port Already in Use Errors
If you see `EADDRINUSE` errors, kill the process on that port:
```bash
# For backend (port 5000)
lsof -ti:5000 | xargs kill -9

# For frontend (port 3000)
lsof -ti:3000 | xargs kill -9
```

## Testing Checklist

- [ ] Backend starts successfully on port 5000
- [ ] MongoDB connects successfully
- [ ] User registration works and returns token + sessionId
- [ ] User login works and returns token + sessionId
- [ ] Profile API returns user data with valid token
- [ ] Profile API returns 401 with invalid/missing token
- [ ] Session validation detects IP mismatches
- [ ] Session validation detects User-Agent mismatches
- [ ] Concurrent session limiting works (max 5 sessions)
- [ ] Session revocation works
- [ ] Frontend login page works
- [ ] Frontend dashboard displays user info
- [ ] Frontend sessions page shows active sessions
- [ ] Logout properly revokes the session

## Files Modified
- `backend/controllers/authController.js` - Fixed `getProfile()` function
