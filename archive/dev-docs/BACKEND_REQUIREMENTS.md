# Backend Requirements Documentation

## Overview

Cyber Witches includes several features that require backend integration for full functionality. Currently, these features use mock implementations that work locally but need proper backend services for production deployment.

## Features Requiring Backend

### 1. Cloud Save System (`js/cloudSave.js`)

**Current Status:** Mock implementation with local storage fallback

**Requirements:**
- **Endpoint:** `https://api.cyberwitches.game/saves`
- **Methods:**
  - `POST /saves` - Save game state
  - `GET /saves/{deviceId}` - Load game state
  - `PUT /saves/{deviceId}` - Update game state
  - `DELETE /saves/{deviceId}` - Delete save

**Data Structure:**
```javascript
{
  version: string,
  timestamp: number,
  gameState: object,
  covenData: object,
  achievementData: object,
  eventData: object,
  chatData: object,
  deviceId: string
}
```

**Authentication:**
- API key authentication (configured via `cloudSave.apiKey`)
- Device ID for user identification

**Conflict Resolution:**
- Server-side timestamp comparison
- Return both local and remote saves on conflict
- Client-side merge logic implemented

### 2. Coven System (`js/covenSystem.js`)

**Current Status:** Mock implementation with local storage

**Requirements:**
- **Endpoints:**
  - `POST /covens` - Create a new coven
  - `GET /covens/{covenId}` - Get coven details
  - `POST /covens/{covenId}/join` - Join a coven
  - `POST /covens/{covenId}/leave` - Leave a coven
  - `GET /covens/{covenId}/members` - Get coven members
  - `POST /covens/{covenId}/rituals/{ritualId}/contribute` - Contribute to ritual

**Data Structures:**

**Coven:**
```javascript
{
  id: string,
  name: string,
  description: string,
  level: number,
  experience: number,
  experienceToNext: number,
  members: CovenMember[],
  activeRituals: CovenRitual[],
  createdAt: number,
  stats: object
}
```

**Coven Member:**
```javascript
{
  id: string,
  name: string,
  contribution: number,
  joinedAt: number,
  isLeader: boolean
}
```

**Coven Ritual:**
```javascript
{
  id: string,
  name: string,
  description: string,
  requirements: object,
  rewards: object,
  progress: number,
  maxProgress: number,
  completedAt: number
}
```

### 3. Coven Chat (`js/covenChat.js`)

**Current Status:** Mock implementation with simulated messages

**Requirements:**
- **Endpoints:**
  - `GET /covens/{covenId}/messages` - Get chat messages
  - `POST /covens/{covenId}/messages` - Send a message
  - `WebSocket /covens/{covenId}/chat` - Real-time chat (optional)

**Data Structure:**
```javascript
{
  id: string,
  covenId: string,
  userId: string,
  userName: string,
  message: string,
  timestamp: number,
  type: 'text' | 'system' | 'event'
}
```

### 4. Social Leaderboards (`js/socialLeaderboards.js`)

**Current Status:** Mock implementation with local leaderboard

**Requirements:**
- **Endpoints:**
  - `GET /leaderboards/global` - Global leaderboard
  - `GET /leaderboards/coven` - Coven leaderboard
  - `GET /leaderboards/weekly` - Weekly leaderboard
  - `POST /leaderboards/update` - Update player score

**Data Structure:**
```javascript
{
  playerId: string,
  playerName: string,
  score: number,
  rank: number,
  timestamp: number
}
```

### 5. Coven Events (`js/covenEvents.js`)

**Current Status:** Mock implementation

**Requirements:**
- **Endpoints:**
  - `GET /events/active` - Get active events
  - `GET /events/{eventId}` - Get event details
  - `POST /events/{eventId}/participate` - Participate in event

### 6. Analytics (`js/analytics.js`)

**Current Status:** Privacy-compliant local analytics

**Requirements (Optional):**
- **Endpoints:**
  - `POST /analytics/event` - Track game events
  - `POST /analytics/performance` - Track performance metrics

**Privacy Considerations:**
- No personal data collection
- Anonymized user IDs
- Opt-in analytics
- GDPR compliant

## Implementation Priority

### Phase 1: Core Features (High Priority)
1. **Cloud Save System** - Essential for user retention
2. **Coven System** - Core social feature

### Phase 2: Social Features (Medium Priority)
3. **Coven Chat** - Enhances social engagement
4. **Social Leaderboards** - Adds competitive element

### Phase 3: Advanced Features (Low Priority)
5. **Coven Events** - Special event system
6. **Analytics** - Optional analytics backend

## Backend Technology Recommendations

### Option 1: Node.js + Express
- **Pros:** JavaScript/TypeScript consistency, easy to deploy
- **Cons:** Need to manage server infrastructure

### Option 2: Serverless (AWS Lambda / Vercel Functions)
- **Pros:** Scalable, pay-as-you-go, easy deployment
- **Cons:** Cold start latency, vendor lock-in

### Option 3: Firebase / Supabase
- **Pros:** Real-time features, authentication built-in, easy setup
- **Cons:** Vendor lock-in, pricing can scale

### Recommended: Supabase or Firebase
- Real-time database for chat
- Built-in authentication
- Easy cloud save implementation
- Free tier available

## Database Schema Recommendations

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  device_id TEXT UNIQUE,
  username TEXT,
  created_at TIMESTAMP,
  last_seen TIMESTAMP
);
```

### Saves Table
```sql
CREATE TABLE saves (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  save_data JSONB,
  version TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Covens Table
```sql
CREATE TABLE covens (
  id UUID PRIMARY KEY,
  name TEXT,
  description TEXT,
  level INTEGER,
  experience INTEGER,
  created_at TIMESTAMP
);
```

### Coven Members Table
```sql
CREATE TABLE coven_members (
  id UUID PRIMARY KEY,
  coven_id UUID REFERENCES covens(id),
  user_id UUID REFERENCES users(id),
  contribution INTEGER,
  joined_at TIMESTAMP,
  is_leader BOOLEAN
);
```

## Security Considerations

1. **Rate Limiting:** Implement rate limiting on all endpoints
2. **Input Validation:** Validate all user inputs
3. **CORS:** Configure CORS for production domain
4. **Authentication:** Use JWT tokens or session-based auth
5. **Data Sanitization:** Sanitize all user-generated content
6. **SQL Injection:** Use parameterized queries
7. **XSS Prevention:** Sanitize chat messages and user input

## Testing Requirements

1. **Unit Tests:** Test all API endpoints
2. **Integration Tests:** Test full workflows
3. **Load Testing:** Test under high load
4. **Security Testing:** Test for vulnerabilities

## Deployment Checklist

- [ ] Set up production database
- [ ] Configure environment variables
- [ ] Set up CORS for production domain
- [ ] Implement rate limiting
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Set up SSL/TLS certificates
- [ ] Test all endpoints
- [ ] Load testing
- [ ] Security audit

## Current Mock Implementation Notes

The current mock implementations allow the game to function fully offline. To enable backend features:

1. Update `cloudSave.js` to use real API endpoints
2. Update `covenSystem.js` to use real API endpoints
3. Update `covenChat.js` to use WebSocket or polling
4. Update `socialLeaderboards.js` to fetch real leaderboards
5. Configure API keys and endpoints in environment variables

All mock implementations include error handling and fallback to local storage, so the game will continue to work even if backend services are unavailable.

