# 🔐 Session Management & Session Hijacking Prevention System

## Overview
This project implements a **secure session management system** that prevents session hijacking attacks in a MERN stack application.

## 🎯 Security Features Implemented

### 1. **Session Tracking**
- Each login creates a unique session with:
  - Session ID (UUID)
  - Device information (browser, OS, device type)
  - IP address
  - User agent
  - Login time and last activity timestamp
  - Expiration time

### 2. **Session Hijacking Prevention**
- **IP Address Validation**: Detects if request comes from different IP
- **User-Agent Validation**: Detects if device/browser has changed
- **Automatic Session Termination**: Suspicious sessions are automatically revoked
- **Session Expiry**: Sessions expire after 7 days
- **Concurrent Session Limiting**: Maximum 5 active sessions per user

### 3. **Session Management Features**
- View all active sessions
- See device info, IP, and last activity for each session
- Revoke individual sessions
- Logout all other devices (keep current session)
- Session history tracking

## 🛠️ Technical Implementation

### Backend Components

#### Models
- **`Session.js`**: MongoDB schema for session storage
  - Tracks userId, sessionId, token, IP, device info, timestamps
  - Auto-expires old sessions using MongoDB TTL index

#### Middleware
- **`sessionMiddleware.js`**: Validates sessions on every request
  - Verifies JWT token
  - Checks session exists and is active
  - Validates IP and User-Agent match
  - Detects suspicious activity
  - Updates last activity timestamp

#### Controllers
- **`authController.js`**: Enhanced with session creation
  - Creates new session on login/register
  - Limits concurrent sessions
  - Revokes oldest session when limit exceeded

- **`sessionController.js`**: Session management endpoints
  - Get active sessions
  - Revoke specific session
  - Revoke all other sessions
  - Get session history

#### Routes
- **`/api/auth/login`**: Login + create session
- **`/api/auth/register`**: Register + create session
- **`/api/auth/logout`**: Logout + revoke session
- **`/api/auth/profile`**: Get user profile (protected)
- **`/api/sessions/active`**: Get all active sessions
- **`/api/sessions/:sessionId`**: Revoke specific session
- **`/api/sessions/revoke-all`**: Logout all other devices
- **`/api/sessions/history`**: Get session history

### Frontend Components

#### Pages
- **`Sessions.jsx`**: Session management dashboard
  - Lists all active sessions
  - Shows device info and activity
  - Revoke individual sessions
  - Logout all other devices button

#### Services
- **`authService.js`**: Enhanced with session management
  - Stores sessionId in localStorage
  - Handles logout properly
  - Session API calls

## 🔒 How It Prevents Session Hijacking

### Scenario 1: Attacker Steals Token
1. User logs in from Device A (IP: 192.168.1.100)
2. Session created with IP and User-Agent stored
3. Attacker steals token and tries to use from Device B (IP: 203.0.113.50)
4. Backend detects IP mismatch
5. **Session automatically revoked** ❌
6. Attacker cannot access protected resources

### Scenario 2: Token Reuse Attack
1. User logs out properly
2. Session marked as `isActive: false` in database
3. Attacker tries to reuse old token
4. Backend checks session status
5. **Request rejected** (session not active) ❌

### Scenario 3: Multiple Unauthorized Logins
1. User has 5 active sessions (max limit reached)
2. New login detected
3. **Oldest session automatically revoked**
4. Only 5 most recent sessions remain active

## 📦 Dependencies Added
```json
{
  "uuid": "^9.0.0",           // Generate unique session IDs
  "ua-parser-js": "^1.0.0",   // Parse user-agent for device info
  "express-rate-limit": "^6.0.0" // Rate limiting (optional)
}
```

## 🚀 How to Use

### 1. Login
```javascript
// Frontend automatically stores token and sessionId
const data = await login({ email, password });
localStorage.setItem('token', data.token);
localStorage.setItem('sessionId', data.sessionId);
```

### 2. View Active Sessions
- Navigate to `/sessions` page
- See all devices where you're logged in
- View device info, IP, and last activity

### 3. Revoke Sessions
- Click "Revoke" on any session to log out that device
- Click "Logout All Other Devices" to keep only current session

### 4. Automatic Protection
- Every API request validates session
- IP/Device mismatches are detected automatically
- Suspicious sessions are terminated immediately

## 🧪 Testing Session Hijacking Prevention

### Test 1: IP Mismatch Detection
```bash
# Login and get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Try to use token from different IP (use VPN or proxy)
curl http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Forwarded-For: 203.0.113.50"

# Result: Session revoked, request denied ✅
```

### Test 2: Device Change Detection
```bash
# Login from Chrome
# Copy token
# Try to use same token from different browser/device
# Result: Session revoked ✅
```

### Test 3: Session Expiry
```bash
# Wait 7 days (or modify expiresAt in DB for testing)
# Try to use old token
# Result: Session expired, request denied ✅
```

## 📊 Database Collections

### Sessions Collection
```javascript
{
  "_id": ObjectId,
  "userId": ObjectId,
  "sessionId": "uuid-here",
  "token": "jwt-token-here",
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "deviceInfo": {
    "browser": "Chrome 120",
    "os": "macOS 14",
    "device": "desktop"
  },
  "loginTime": ISODate,
  "lastActivity": ISODate,
  "expiresAt": ISODate,
  "isActive": true,
  "revokedAt": null,
  "revokedReason": null,
  "createdAt": ISODate,
  "updatedAt": ISODate
}
```

## 🎨 UI Screenshots

### Dashboard
- View profile information
- Link to "Manage Active Sessions"

### Sessions Page
- List of all active sessions
- Current session highlighted in green
- Device info (browser, OS, device type)
- IP address
- Login time and last activity
- "Revoke" button for each session
- "Logout All Other Devices" button

## 🔧 Configuration

### Environment Variables
```properties
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
```

### Session Configuration
- **Max Concurrent Sessions**: 5 (configurable in `authController.js`)
- **Session Expiry**: 7 days (configurable in token generation)
- **JWT Expiry**: 7 days (configurable in `generateToken.js`)

## 🛡️ Security Best Practices Implemented

1. ✅ JWT tokens include session ID
2. ✅ Sessions stored in database (not just JWT)
3. ✅ IP address validation
4. ✅ User-Agent validation
5. ✅ Automatic session expiry
6. ✅ Concurrent session limiting
7. ✅ Suspicious activity detection
8. ✅ Proper logout (session revocation)
9. ✅ Session activity tracking
10. ✅ User visibility into active sessions

## 🎯 What Makes This Secure?

Unlike simple JWT-only authentication:
- **Database Validation**: Every request validates against database
- **Session Revocation**: Tokens can be invalidated server-side
- **Activity Monitoring**: Track and detect unusual patterns
- **User Control**: Users can manage their own sessions
- **Automatic Protection**: System automatically detects hijacking attempts

## 📝 Future Enhancements

- [ ] Email notifications for new logins
- [ ] Location-based detection (IP geolocation)
- [ ] Trusted device management
- [ ] Token refresh mechanism
- [ ] Rate limiting per session
- [ ] Suspicious activity dashboard
- [ ] Two-factor authentication integration
- [ ] Device fingerprinting (canvas, WebGL, etc.)

## 🚀 Running the Project

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

### MongoDB Atlas
- Ensure IP is whitelisted
- Database: `mini-project6`

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `POST /api/auth/logout` - Logout and revoke session (protected)

### Session Management
- `GET /api/sessions/active` - Get all active sessions (protected)
- `DELETE /api/sessions/:sessionId` - Revoke specific session (protected)
- `POST /api/sessions/revoke-all` - Logout all other devices (protected)
- `GET /api/sessions/history` - Get session history (protected)

---

**Built with MERN Stack** 🚀
MongoDB • Express.js • React • Node.js

**Security First** 🔐
Session Management • Hijacking Prevention • User Control
