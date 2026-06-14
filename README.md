# Codzy 🚀

**Codzy** is a feature-rich, full-stack competitive programming platform — a LeetCode-inspired application with an AI tutor, real-time study groups, video interviews, solution video uploads, and live collaboration built in.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Auth** | JWT-based login/signup with httpOnly cookies; Redis token blacklist for secure logout |
| 🧩 **Problem Bank** | Admins create problems with visible & hidden test cases, starter code, and reference solutions |
| ⚡ **Code Execution** | Submit in C++, Java, or JavaScript — executed via the **Piston API** with real-time verdict |
| 📜 **Submission History** | Track all attempts with status (Accepted / Wrong Answer / Error), runtime, and memory |
| 🤖 **AI Doubt Solver** | Gemini 2.5 Flash powered DSA tutor — gives hints, explains concepts, or provides full solutions on demand |
| 👥 **Study Groups** | Create/join private or public groups with invite codes, live sessions, group chat, and progress tracking |
| 🎥 **Mock Interviews** | Start a live video interview session on a problem using Stream Video SDK |
| 📹 **Solution Videos** | Admins/users upload editorial/solution videos via Cloudinary for each problem |
| 💬 **Real-time Chat** | Socket.io powered group messaging; Stream Chat SDK for interview channels |
| 🛡️ **Role-based Access** | Admin panel to create/delete problems and upload videos; users have a read/solve-only flow |

---

## 🛠️ Tech Stack

### Backend (`/Day02`)
| Tech | Purpose |
|---|---|
| Node.js + Express 5 | REST API server |
| MongoDB + Mongoose | Primary database |
| Redis | Token blacklist (logout invalidation) |
| Socket.io | Real-time group messaging & live sessions |
| Piston API | Remote code execution (C++, Java, JS) |
| Google Gemini 2.5 Flash (`@google/genai`) | AI doubt-solving tutor |
| Stream Video SDK (`@stream-io/node-sdk`) | Mock interview video calls |
| Stream Chat (`stream-chat`) | Interview chat channels |
| Cloudinary | Solution video storage & signed uploads |
| JWT + bcrypt | Authentication & password hashing |
| Zod + Validator | Input validation |
| Nanoid | Unique invite code generation |

### Frontend (`/frontend`)
| Tech | Purpose |
|---|---|
| React 19 + Vite | UI framework |
| Tailwind CSS 4 + DaisyUI | Styling |
| Redux Toolkit + Zustand | Global & local state management |
| React Router 7 | Client-side routing |
| Monaco Editor (`@monaco-editor/react`) | In-browser code editor |
| React Hook Form + Zod | Form validation |
| Stream Video React SDK | Video call UI |
| Stream Chat React | Chat UI |
| Socket.io Client | Real-time updates |
| React Markdown + Syntax Highlighter | Problem rendering |
| React Resizable Panels | Split-pane problem/editor layout |
| React Hot Toast | Notifications |
| Axios | HTTP client |

---

## 📁 Project Structure

```
Codzy-main/
├── Day02/                          # Backend
│   └── src/
│       ├── index.js                # Entry point, Express + Socket.io setup
│       ├── config/
│       │   ├── db.js               # MongoDB connection
│       │   ├── redis.js            # Redis client
│       │   └── stream.js           # Stream Video & Chat clients
│       ├── controllers/
│       │   ├── userAuthent.js      # Signup, signin, logout
│       │   ├── userProblem.js      # Fetch problems, admin CRUD
│       │   ├── userSubmission.js   # Submit code, run via Piston
│       │   ├── solveDoubt.js       # Gemini AI tutor
│       │   ├── studyGroup.js       # Group CRUD, sessions, messages, progress
│       │   ├── interviewController.js  # Mock interview sessions
│       │   └── videoSection.js     # Cloudinary video uploads
│       ├── models/
│       │   ├── user.js
│       │   ├── problem.js          # Problem schema (test cases, starter code, solutions)
│       │   ├── Submission.js
│       │   ├── StudyGroup.js
│       │   ├── GroupMember.js
│       │   ├── GroupMessage.js
│       │   ├── GroupProgress.js
│       │   ├── GroupSession.js
│       │   ├── InterviewSession.js
│       │   └── solutionVideo.js
│       ├── routes/
│       │   ├── userAuth.js
│       │   ├── problemCreator.js
│       │   ├── submit.js
│       │   ├── aiChatting.js
│       │   ├── studyGroup.js
│       │   ├── videoCreator.js
│       │   └── interview.js
│       ├── middleware/
│       │   ├── userMiddleware.js   # JWT verification
│       │   └── adminMiddleware.js  # Admin role check
│       ├── socket/
│       │   └── socketServer.js     # Socket.io event handlers
│       └── utils/
│           ├── problemUtility.js   # Piston API runner
│           └── validator.js
└── frontend/
    └── src/
        ├── pages/
        │   ├── LandingPage.jsx
        │   ├── Login.jsx / Signup.jsx
        │   ├── Homepage.jsx         # Problem list
        │   ├── Dashboard.jsx        # User dashboard
        │   ├── ProblemPage.jsx      # Problem + code editor + AI chat
        │   ├── StudyGroups.jsx      # Group browser
        │   ├── GroupDetail.jsx      # Group chat & live session
        │   ├── InterviewDashboard.jsx
        │   ├── InterviewSessionPage.jsx
        │   ├── LiveSession.jsx
        │   └── Admin.jsx
        ├── components/
        │   ├── CodeEditor.jsx       # Monaco-based editor
        │   ├── ChatAi.jsx           # Gemini AI chat panel
        │   ├── SubmissionHistory.jsx
        │   ├── EditorialPage.jsx
        │   ├── AdminPanel.jsx / AdminUpload.jsx / AdminDelete.jsx
        │   └── VideoCallUI.jsx
        └── store/
            ├── store.js             # Redux store
            └── studyGroupStore.js   # Zustand store
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB instance (local or Atlas)
- Redis instance (local or Redis Cloud)
- [Piston API](https://piston.readthedocs.io/) (self-hosted or public endpoint)
- Google Gemini API key
- Stream account (Video + Chat) — [getstream.io](https://getstream.io)
- Cloudinary account

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/Codzy.git
cd Codzy
```

---

### 2. Backend Setup

```bash
cd Day02
npm install
```

Create a `.env` file in `Day02/`:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/codzy
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret

# Google Gemini
GEMINI_KEY=your_gemini_api_key

# Stream (Video + Chat)
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

CLIENT_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev     # development (nodemon)
npm start       # production
```

API runs at `http://localhost:3000`.

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

## 🔌 API Endpoints

### Auth — `/user`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/user/signup` | No | Register |
| POST | `/user/signin` | No | Login (sets cookie) |
| POST | `/user/logout` | Yes | Logout (blacklists token) |

### Problems — `/problem`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/problem/all` | Yes | List all problems |
| POST | `/problem/create` | Admin | Create a problem |
| PUT | `/problem/:id` | Admin | Update a problem |
| DELETE | `/problem/:id` | Admin | Delete a problem |

### Submissions — `/submission`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/submission/submit` | Yes | Submit code (runs via Piston) |
| GET | `/submission/history/:problemId` | Yes | Get submission history |

### AI Tutor — `/ai`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/ai/solve-doubt` | Yes | Chat with Gemini AI about a problem |

### Study Groups — `/study-groups`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/study-groups/create` | Yes | Create a group |
| POST | `/study-groups/join` | Yes | Join via invite code |
| GET | `/study-groups/my-groups` | Yes | List user's groups |
| GET | `/study-groups/:groupId` | Yes | Group details |
| DELETE | `/study-groups/:groupId/leave` | Yes | Leave a group |
| POST | `/study-groups/:groupId/session/start` | Yes | Start live session |
| GET | `/study-groups/:groupId/messages` | Yes | Fetch group messages |

### Interviews — `/interview`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/interview/create` | Yes | Create interview session |
| GET | `/interview/active` | Yes | List active sessions |
| GET | `/interview/my-sessions` | Yes | User's sessions |
| POST | `/interview/:id/join` | Yes | Join a session |
| POST | `/interview/:id/end` | Yes | End a session |
| GET | `/interview/auth/stream-token` | Yes | Get Stream video token |

### Videos — `/video`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/video/upload/:problemId` | Admin | Upload solution video to Cloudinary |
| GET | `/video/:problemId` | Yes | Fetch videos for a problem |

---

## 🔐 Authentication

- Passwords hashed with **bcrypt**.
- Login returns a **JWT** stored in an **httpOnly cookie**.
- Logout adds the token to a **Redis blacklist** to prevent reuse.
- Two middleware roles: `userMiddleware` (all logged-in users) and `adminMiddleware` (admin-only routes).

---

## ⚙️ Supported Languages

Code execution via the Piston API supports:

- **C++**
- **Java**
- **JavaScript**

---

## 📦 Build for Production

**Backend:**
```bash
cd Day02
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

---

## 🤝 Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m 'Add your feature'`
4. Push and open a Pull Request

---

## 📄 License

Open source — MIT. Feel free to use, modify, and build on top of Codzy.

