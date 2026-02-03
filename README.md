# 🏓 ft_transcendence - PingPong Arena

A modern, full-stack real-time multiplayer Pong game platform with chat, tournaments, and comprehensive monitoring.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Fastify](https://img.shields.io/badge/Fastify-000000?style=for-the-badge&logo=fastify&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

---

## 📋 Table of Contents

- [Description](#-description)
- [Team Information](#-team-information)
- [Technical Stack](#-technical-stack)
- [Database Schema](#-database-schema)
- [Features List](#-features-list)
- [Modules](#-modules)
- [Individual Contributions](#-individual-contributions)
- [Instructions](#-instructions)
- [Resources](#-resources)

---

## 📖 Description

**PingPong Arena** is a web-based multiplayer Pong game platform developed as part of the 42 School ft_transcendence project. The application allows users to play the classic Pong game in various modes, chat with other players in real-time, participate in tournaments, and track their progress on leaderboards.

### Key Features

- 🎮 **Multiple Game Modes**: Remote multiplayer, local 1v1, tournaments, and Arena mode
- 💬 **Real-time Chat**: WebSocket-based instant messaging with friend system
- 🔐 **Secure Authentication**: Local auth, OAuth2 (42 Intra, Google), and Two-Factor Authentication
- 🏆 **Tournaments**: Automated bracket system with registration and live matches
- 📊 **Player Statistics**: XP system, levels, leaderboards, and match history
- 🔔 **Real-time Notifications**: Live updates for game invites, friend requests, and messages
- 📈 **Monitoring Stack**: Prometheus metrics with Grafana dashboards
- 📝 **Centralized Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)

---

## 👥 Team Information

| Member | 42 Login | Role | Communication |
|--------|----------|------|---------------|
| **Hicham** | - | Authentication & Chat | Discord, Physical meetings |
| **Mohamed** | - | Ping Pong Game & ELK Stack | Discord, Physical meetings |
| **Zakaria** | - | Arena Game Mode | Discord, Physical meetings |
| **Ayoub** | - | Chat fixes, Grafana & Prometheus | Discord, Physical meetings |

### Communication Channels
- **Discord**: Primary communication for daily standups and quick discussions
- **Physical Meetings**: Regular in-person meetings for planning, code reviews, and pair programming sessions

---

## 🛠 Technical Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.1.0 | UI Framework |
| **TypeScript** | 5.8.3 | Type-safe JavaScript |
| **Vite** | 6.4.1 | Build tool & dev server |
| **TailwindCSS** | 4.1.16 | Utility-first CSS |
| **TanStack Query** | 5.76.1 | Server state management |
| **Zustand** | 5.0.5 | Client state management |
| **React Router** | 7.6.0 | Client-side routing |
| **Axios** | 1.13.1 | HTTP client |
| **Zod** | 3.24.4 | Schema validation |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Fastify** | 5.3.3 | Web framework |
| **TypeScript** | 5.8.3 | Type-safe JavaScript |
| **SQLite3** | 5.1.7 | Database |
| **@fastify/jwt** | 9.1.0 | JWT authentication |
| **@fastify/websocket** | 11.0.2 | WebSocket support |
| **@fastify/oauth2** | 8.1.2 | OAuth2 integration |
| **Zod** | 3.25.74 | Request validation |
| **bcrypt** | 6.0.0 | Password hashing |
| **prom-client** | - | Prometheus metrics |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| **Docker & Docker Compose** | Containerization |
| **Nginx** | Reverse proxy, SSL termination |
| **Prometheus** | Metrics collection |
| **Grafana** | Metrics visualization |
| **Elasticsearch** | Log storage & search |
| **Logstash** | Log processing |
| **Kibana** | Log visualization |

### Why SQLite?
SQLite was chosen for its:
- **Simplicity**: No separate database server required
- **Portability**: Single file database, easy to backup and deploy
- **Performance**: Excellent for read-heavy workloads and moderate write loads
- **Zero Configuration**: Works out of the box with minimal setup

### Major Technical Decisions
1. **Fastify over Express**: Better performance, built-in TypeScript support, and schema validation
2. **Zustand over Redux**: Simpler API, smaller bundle size, and sufficient for our state management needs
3. **TanStack Query**: Automatic caching, background refetching, and optimistic updates for better UX
4. **WebSockets**: Real-time communication for chat, game state, and notifications

---

## 🗄 Database Schema

### Visual Representation

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     users       │────<│    messages     │>────│     users       │
├─────────────────┤     ├─────────────────┤     └─────────────────┘
│ id (PK)         │     │ id (PK)         │
│ username        │     │ sender_id (FK)  │
│ display_name    │     │ receiver_id (FK)│
│ password        │     │ content         │
│ email           │     │ created_at      │
│ profile_picture │     └─────────────────┘
│ oauth_type      │
│ two_factor_enabled│    ┌─────────────────┐
│ created_at      │────<│    friends      │
└─────────────────┘     ├─────────────────┤
        │               │ id (PK)         │
        │               │ sender_id (FK)  │
        │               │ receiver_id (FK)│
        │               │ created_at      │
        │               └─────────────────┘
        │
        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  player_stats   │     │     games       │────<│  game_players   │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │     │ id (PK)         │
│ user_id (FK)    │     │ mode            │     │ game_id (FK)    │
│ total_xp        │     │ status          │     │ user_id (FK)    │
│ level           │     │ winner_id (FK)  │     │ position        │
│ wins            │     │ started_at      │     │ score           │
│ losses          │     │ ended_at        │     │ xp_gained       │
│ games_played    │     └─────────────────┘     └─────────────────┘
└─────────────────┘

┌─────────────────┐     ┌─────────────────────┐  ┌─────────────────────┐
│  tournaments    │────<│ tournament_players  │  │ tournament_matches  │
├─────────────────┤     ├─────────────────────┤  ├─────────────────────┤
│ id (PK)         │     │ id (PK)             │  │ id (PK)             │
│ name            │     │ tournament_id (FK)  │  │ tournament_id (FK)  │
│ status          │     │ user_id (FK)        │  │ round               │
│ created_by (FK) │     │ registered_at       │  │ match_number        │
│ winner_id (FK)  │     └─────────────────────┘  │ player1_id (FK)     │
│ max_players     │                              │ player2_id (FK)     │
│ current_round   │                              │ winner_id (FK)      │
│ start_time      │                              │ game_id (FK)        │
└─────────────────┘                              │ status              │
                                                 └─────────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  arena_games    │────<│ arena_players   │     │  arena_events   │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │     │ id (PK)         │
│ status          │     │ arena_game_id   │     │ arena_game_id   │
│ winner_user_id  │     │ user_id (FK)    │     │ type            │
│ target_round_wins│    │ position        │     │ payload (JSON)  │
│ created_at      │     │ is_ai           │     │ created_at      │
│ started_at      │     │ round_wins      │     └─────────────────┘
│ ended_at        │     │ last_x, last_y  │
└─────────────────┘     └─────────────────┘
```

### Tables Summary

| Table | Description | Key Fields |
|-------|-------------|------------|
| `users` | User accounts | username, email, password, oauth_type, two_factor_enabled |
| `messages` | Chat messages | sender_id, receiver_id, content |
| `contacts` | User contact list | user_id, contact_id |
| `requests` | Friend/chat requests | sender_id, receiver_id, request_type |
| `friends` | Friend relationships | sender_id, receiver_id |
| `blocks` | Blocked users | user_id, blocked_user_id |
| `games` | Pong game sessions | mode, status, winner_id |
| `game_players` | Players in games | game_id, user_id, score, xp_gained |
| `tournaments` | Tournament metadata | name, status, max_players, current_round |
| `tournament_players` | Tournament participants | tournament_id, user_id |
| `tournament_matches` | Tournament bracket | round, match_number, player1/2_id, winner_id |
| `player_stats` | Player statistics | total_xp, level, wins, losses |
| `user_badges` | Achievements | badge_name, badge_icon |
| `notifications` | User notifications | type, title, message, is_read |
| `arena_games` | Arena mode games | status, target_round_wins |
| `arena_players` | Arena participants | position, is_ai, round_wins |
| `arena_events` | Arena event log | type, payload |

---

## ✨ Features List

| Feature | Description | Implemented By |
|---------|-------------|----------------|
| **User Registration** | Create account with email verification | Hicham |
| **Local Authentication** | Login with username/email + password | Hicham |
| **OAuth2 (42 Intra)** | Login with 42 School account | Hicham |
| **OAuth2 (Google)** | Login with Google account | Hicham |
| **Two-Factor Auth (2FA)** | Email-based OTP verification | Hicham |
| **Password Reset** | Email-based password recovery | Hicham |
| **User Profiles** | View/edit profile, avatar upload | Hicham |
| **Real-time Chat** | WebSocket instant messaging | Hicham, Ayoub |
| **Friend System** | Send/accept friend requests | Hicham |
| **Block Users** | Block/unblock functionality | Hicham |
| **Contact List** | Manage chat contacts | Hicham |
| **Remote Pong Game** | Real-time multiplayer pong | Mohamed |
| **Local Pong Game** | Same-device 2-player game | Mohamed |
| **Game Engine** | Canvas-based pong physics | Mohamed |
| **Tournaments** | Bracket-based competitions | Mohamed |
| **Tournament Registration** | Join/leave tournaments | Mohamed |
| **Match History** | View past games | Mohamed |
| **Leaderboard** | Global player rankings | Mohamed |
| **XP & Leveling** | Experience points system | Mohamed |
| **Player Statistics** | Wins, losses, win rate | Mohamed |
| **Arena Mode** | Alternative game mode | Zakaria |
| **Arena Matchmaking** | Queue-based player matching | Zakaria |
| **Arena AI Opponent** | Play against computer | Zakaria |
| **Arena Statistics** | Arena-specific stats | Zakaria |
| **Arena Spectating** | Watch live arena games | Zakaria |
| **Prometheus Metrics** | Application monitoring | Ayoub |
| **Grafana Dashboards** | Metrics visualization | Ayoub |
| **ELK Stack Logging** | Centralized log management | Mohamed |
| **Real-time Notifications** | Live notification system | Mohamed, Hicham |
| **Online Status** | Show user online/offline | Hicham |

---

## 📦 Modules

### Module Summary

| Category | Module | Type | Points |
|----------|--------|------|--------|
| Web | Backend Framework (Fastify) | Major | 2 |
| Web | Frontend Framework (React) | Minor | 1 |
| User Management | Standard User Management | Major | 2 |
| User Management | Remote Authentication (OAuth2) | Major | 2 |
| Gameplay | Remote Players | Major | 2 |
| Gameplay | Multiple Players (Tournaments) | Major | 2 |
| Gameplay | Another Game (Arena) | Major | 2 |
| Cybersecurity | 2FA & JWT | Major | 2 |
| DevOps | ELK Stack | Major | 2 |
| DevOps | Monitoring (Prometheus/Grafana) | Minor | 1 |
| **Total** | | | **18 pts** |

### Module Details

#### 1. Backend Framework - Fastify (Major - 2pts)
**Justification**: Fastify provides excellent TypeScript support, built-in schema validation with Zod, and superior performance compared to Express.

**Implementation**:
- RESTful API with `/api` prefix
- WebSocket integration for real-time features
- JWT authentication middleware
- Request/response validation with Zod schemas
- Plugin-based architecture

**Worked on by**: All team members

---

#### 2. Frontend Framework - React (Minor - 1pt)
**Justification**: React 19 with modern hooks, combined with Vite for fast development and TailwindCSS for styling.

**Implementation**:
- Single Page Application with React Router
- Component-based architecture
- TanStack Query for server state
- Zustand for client state
- Responsive design with TailwindCSS

**Worked on by**: All team members

---

#### 3. Standard User Management (Major - 2pts)
**Justification**: Comprehensive user system with profiles, avatars, friends, and blocking.

**Implementation**:
- User registration with email verification
- Profile customization (avatar, display name)
- Friend request system
- User blocking functionality
- Match history per user
- Statistics dashboard

**Worked on by**: Hicham

---

#### 4. Remote Authentication - OAuth2 (Major - 2pts)
**Justification**: Secure third-party authentication with 42 Intra and Google.

**Implementation**:
- 42 Intra OAuth2 integration
- Google OAuth2 integration
- Automatic account creation/linking
- Session management with JWT cookies

**Worked on by**: Hicham

---

#### 5. Remote Players (Major - 2pts)
**Justification**: Core multiplayer functionality with real-time game synchronization.

**Implementation**:
- WebSocket-based game rooms
- Real-time paddle and ball synchronization
- Score tracking and game completion
- Matchmaking system

**Worked on by**: Mohamed

---

#### 6. Multiple Players - Tournaments (Major - 2pts)
**Justification**: Competitive tournament system with bracket management.

**Implementation**:
- Tournament creation with configurable player limits (4, 8, 16)
- Registration system with deadline
- Automatic bracket generation
- Round progression
- Champion tracking

**Worked on by**: Mohamed

---

#### 7. Another Game - Arena Mode (Major - 2pts)
**Justification**: Alternative game mode with different mechanics and separate statistics.

**Implementation**:
- Round-based gameplay (first to X wins)
- Dedicated matchmaking queue
- AI opponent option
- Spectator mode
- Separate leaderboard and statistics

**Worked on by**: Zakaria

---

#### 8. Two-Factor Authentication & JWT (Major - 2pts)
**Justification**: Enhanced security with 2FA and secure session management.

**Implementation**:
- Email-based OTP for 2FA
- Enable/disable 2FA in settings
- JWT tokens in HTTP-only cookies
- Token refresh mechanism
- Secure password hashing with bcrypt

**Worked on by**: Hicham

---

#### 9. ELK Stack - Log Management (Major - 2pts)
**Justification**: Centralized logging for debugging and monitoring.

**Implementation**:
- Elasticsearch for log storage
- Logstash for log processing (GELF input)
- Kibana for log visualization
- Docker logging driver integration
- Health checks and automatic restart

**Worked on by**: Mohamed

---

#### 10. Monitoring - Prometheus & Grafana (Minor - 1pt)
**Justification**: Application performance monitoring and alerting.

**Implementation**:
- Prometheus metrics endpoint (`/metrics`)
- Node exporter for system metrics
- Grafana dashboards
- Custom application metrics

**Worked on by**: Ayoub

---

## 👤 Individual Contributions

### Hicham
**Focus**: Authentication & Chat System

**Contributions**:
- ✅ User registration with email confirmation
- ✅ Local authentication (login/logout)
- ✅ OAuth2 integration (42 Intra & Google)
- ✅ Two-Factor Authentication (2FA)
- ✅ Password reset functionality
- ✅ JWT token management
- ✅ Real-time chat with WebSockets
- ✅ Friend request system
- ✅ User blocking functionality
- ✅ Contact list management
- ✅ User profile settings
- ✅ Online/offline status tracking
- ✅ Notification system (partial)

**Challenges**:
- Managing OAuth2 callback flows with different providers
- Implementing secure 2FA with email OTP
- Real-time chat message delivery and ordering

---

### Mohamed
**Focus**: Ping Pong Game & ELK Stack

**Contributions**:
- ✅ Pong game engine (physics, collision detection)
- ✅ Remote multiplayer game implementation
- ✅ Local 2-player game mode
- ✅ Tournament system (creation, registration, brackets)
- ✅ Match progression and winner determination
- ✅ XP and leveling system
- ✅ Player statistics tracking
- ✅ Leaderboard functionality
- ✅ Match history pages
- ✅ ELK Stack setup and configuration
- ✅ Docker logging integration
- ✅ Kibana dashboards

**Challenges**:
- Synchronizing game state across WebSocket connections
- Implementing fair tournament bracket generation
- Setting up ELK Stack with proper health checks

---

### Zakaria
**Focus**: Arena Game Mode

**Contributions**:
- ✅ Arena game mode design and implementation
- ✅ Arena-specific game mechanics
- ✅ Arena matchmaking queue system
- ✅ AI opponent implementation
- ✅ Arena spectator mode
- ✅ Arena statistics (separate from pong)
- ✅ Arena match history
- ✅ Arena WebSocket handlers
- ✅ Arena database schema

**Challenges**:
- Creating distinct gameplay experience from main pong
- Implementing reliable matchmaking
- Managing spectator connections without affecting gameplay

---

### Ayoub
**Focus**: Monitoring & Bug Fixes

**Contributions**:
- ✅ Prometheus integration and metrics endpoint
- ✅ Grafana setup and dashboards
- ✅ Node exporter configuration
- ✅ Chat bug fixes and improvements
- ✅ Minor UI/UX improvements

**Challenges**:
- Configuring Prometheus to scrape all services
- Creating meaningful Grafana dashboards
- Debugging WebSocket connection issues in chat

---

## 🚀 Instructions

### Prerequisites

- **Docker** (v20.10+) and **Docker Compose** (v2.0+)
- **Node.js** (v18+) - for local development only
- **Git**
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/0bcMoon/chatApp.git
   cd chatApp
   ```

2. **Create environment file**
   ```bash
   cp env-example .env
   ```

3. **Configure the `.env` file**
   ```env
   # JWT Secret (generate a strong random string)
   JWT_SECRET=your-super-secret-jwt-key-here

   # OAuth2 - 42 Intra (get from 42 intra settings)
   INTRA_CLIENT_ID=your-42-client-id
   INTRA_CLIENT_SECRET=your-42-client-secret
   INTRA_REDIRECT_URI=https://localhost:8443/api/auth/oauth/42/callback

   # OAuth2 - Google (get from Google Cloud Console)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_REDIRECT_URI=https://localhost:8443/api/auth/oauth/google/callback

   # Email Service (for 2FA and password reset)
   RESEND_API_KEY=your-resend-api-key
   EMAIL_FROM=noreply@yourdomain.com

   # ELK Stack
   ELASTIC_PASSWORD=your-elastic-password
   ```

4. **Configure frontend environment** (for development)
   ```bash
   cp app/frontend/env-example app/frontend/.env
   ```

### Running with Docker (Recommended)

1. **Build and start all services**
   ```bash
   make          # or: docker-compose up --build
   ```

2. **Access the application**
   - **Frontend**: https://localhost:8443
   - **Grafana**: http://localhost:3000 (admin/admin)
   - **Kibana**: http://localhost:5601
   - **Prometheus**: http://localhost:9090

3. **Stop all services**
   ```bash
   make down     # or: docker-compose down
   ```

### Local Development

1. **Install backend dependencies**
   ```bash
   cd app/backend
   npm install
   ```

2. **Initialize database**
   ```bash
   npm run seed
   ```

3. **Start backend server**
   ```bash
   npm run dev
   ```

4. **Install frontend dependencies** (new terminal)
   ```bash
   cd app/frontend
   npm install
   ```

5. **Start frontend dev server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000

### SSL Certificates

For HTTPS in development, self-signed certificates are provided in `nginx/ssl/`. 
Your browser will show a security warning - this is expected for self-signed certificates.

---

## 📚 Resources

### Documentation & Tutorials

- [Fastify Documentation](https://fastify.dev/docs/latest/)
- [React Documentation](https://react.dev/)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Prometheus & Grafana Tutorial](https://www.youtube.com/watch?v=L-dDeZjZUiA)
- [Prometheus Querying API](https://prometheus.io/docs/prometheus/latest/querying/api/)

### AI Usage Disclosure

AI tools (GitHub Copilot, ChatGPT) were used to assist with:

1. **Code Generation**:
   - Boilerplate code for routes and schemas
   - TypeScript type definitions
   - React component templates

2. **Debugging**:
   - Identifying WebSocket connection issues
   - Docker configuration troubleshooting
   - Database query optimization

3. **Documentation**:
   - README structure and formatting
   - Code comments and JSDoc

4. **Learning**:
   - Understanding OAuth2 flows
   - ELK Stack configuration
   - Prometheus metric types

All AI-generated code was reviewed, tested, and modified by team members to ensure correctness and understanding.

---

## 📄 License

This project was developed as part of the 42 School curriculum.

---

## 🙏 Acknowledgments

- 42 School for the project requirements
- The open-source community for the amazing tools and libraries
- Our peers for testing and feedback

---

<div align="center">
  <p>Made with ❤️ by the ft_transcendence team</p>
  <p>© 2026</p>
</div>
