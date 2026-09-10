# 🚀 Codzy - Production Deployment Guide

This guide provides comprehensive, step-by-step instructions to deploy both the **Backend API** and **Frontend Client** of the Codzy platform (LeetCode Clone with Study Groups, Live Coding, and AI Assistance).

---

## 📋 Table of Contents
1. [Prerequisites & External Services](#1-prerequisites--external-services)
2. [Backend Deployment (Render / Railway / Docker)](#2-backend-deployment)
3. [Frontend Deployment (Vercel / Netlify)](#3-frontend-deployment)
4. [Environment Variables Reference](#4-environment-variables-reference)
5. [Verification & Health Check](#5-verification--health-check)
6. [Troubleshooting & FAQs](#6-troubleshooting--faqs)

---

## 1. Prerequisites & External Services

Before deploying, ensure you have credentials for the following services:

| Service | Purpose | Setup Link / Steps |
|---|---|---|
| **MongoDB Atlas** | Database | Create a free M0 cluster on [MongoDB Atlas](https://www.mongodb.com/atlas), whitelist `0.0.0.0/0` in Network Access, and get your connection string. |
| **Upstash / Redis Cloud** | Token Blacklist & Session Store | Create a free Redis instance on [Upstash](https://upstash.com/) or [Redis Cloud](https://redis.io/cloud/) and copy the `rediss://...` connection URL. |
| **Stream.io** | Video Calls & Live Chat | Create an app on [Stream.io](https://getstream.io/) and get your `API_KEY` and `API_SECRET`. |
| **Google Gemini AI** | AI Problem Solving / Hints | Generate an API key from [Google AI Studio](https://aistudio.google.com/). |
| **Cloudinary** | Video / Media Storage | Get your `Cloud Name`, `API Key`, and `API Secret` from [Cloudinary Console](https://cloudinary.com/). |

---

## 2. Backend Deployment

### Option A: Deploy on [Render](https://render.com) (Recommended)

1. Sign in to **Render** and click **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure the service:
   - **Name**: `codzy-backend` (or your preferred name)
   - **Root Directory**: `Day02`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Under **Environment Variables**, add:
   ```env
   NODE_ENV=production
   PORT=10000
   CLIENT_URL=https://your-frontend.vercel.app
   DB_CONNECTION_STRING=mongodb+srv://<user>:<password>@cluster0.mongodb.net/Leetcode?retryWrites=true&w=majority
   JWT_KEY=your_secure_jwt_secret_min_32_characters
   REDIS_URL=rediss://default:<password>@<host>:<port>
   GEMINI_KEY=your_gemini_api_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   STREAM_API_KEY=your_stream_api_key
   STREAM_API_SECRET=your_stream_api_secret
   ```
5. Click **Create Web Service**.
6. Once deployed, copy your backend URL (e.g., `https://codzy-backend.onrender.com`).

---

### Option B: Deploy with Docker (AWS / DigitalOcean / Fly.io / VPS)

1. Build the Docker image from the `Day02` directory:
   ```bash
   cd Day02
   docker build -t codzy-backend .
   ```
2. Run the container with your environment variables:
   ```bash
   docker run -d \
     -p 5000:5000 \
     --env-file .env \
     --name codzy-backend \
     codzy-backend
   ```

---

## 3. Frontend Deployment

### Deploy on [Vercel](https://vercel.com) (Recommended)

1. Sign in to **Vercel** and click **Add New...** -> **Project**.
2. Import your GitHub repository.
3. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Select `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Under **Environment Variables**, add:
   ```env
   VITE_API_URL=https://codzy-backend.onrender.com
   VITE_SOCKET_URL=https://codzy-backend.onrender.com
   VITE_STREAM_API_KEY=your_stream_api_key
   ```
5. Click **Deploy**.
6. After deployment, copy your Vercel URL (e.g. `https://codzy.vercel.app`).
7. **Important**: Go back to your backend (Render/Railway) environment settings and update `CLIENT_URL` to include your new Vercel URL!

---

## 4. Environment Variables Reference

### Backend (`Day02/.env`)

| Variable | Required | Description | Example |
|---|---|---|---|
| `NODE_ENV` | Yes | App environment (`production` enables secure cookies & strict CORS) | `production` |
| `PORT` | Optional | Port for Express server (Defaults to `5000`) | `5000` |
| `CLIENT_URL` | Yes | Allowed frontend origin(s) (comma-separated if multiple) | `https://codzy.vercel.app` |
| `DB_CONNECTION_STRING` | Yes | MongoDB Atlas connection string | `mongodb+srv://...` |
| `JWT_KEY` | Yes | Secret key used for JWT signing & verification | `secret_key_123` |
| `REDIS_URL` | Yes | Redis connection URL for token blacklisting | `rediss://default:...` |
| `GEMINI_KEY` | Yes | Google Gemini AI API key | `AIza...` |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary account name | `mycloud` |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key | `123456789` |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret | `abc123...` |
| `STREAM_API_KEY` | Yes | Stream.io public API key | `m4wjtwgvjtg4` |
| `STREAM_API_SECRET` | Yes | Stream.io private secret | `88cm...` |

### Frontend (`frontend/.env`)

| Variable | Required | Description | Example |
|---|---|---|---|
| `VITE_API_URL` | Yes | Base URL of deployed backend | `https://codzy-backend.onrender.com` |
| `VITE_SOCKET_URL` | Yes | URL for WebSocket connection | `https://codzy-backend.onrender.com` |
| `VITE_STREAM_API_KEY` | Yes | Stream.io public API key | `m4wjtwgvjtg4` |

---

## 5. Verification & Health Check

After both frontend and backend are deployed:

1. **Backend Health Check**:
   Visit `https://your-backend-api.onrender.com/health` in your browser. You should receive:
   ```json
   {
     "status": "ok",
     "uptime": 12.34,
     "timestamp": "2026-09-11T..."
   }
   ```

2. **Frontend & Authentication Check**:
   - Open your frontend URL (e.g. `https://your-app.vercel.app`).
   - Register a new user account or log in.
   - Verify that cookies and authentication tokens are properly stored.
   - Navigate to `/interview/dashboard` or `/study-groups` to verify React Router SPA routing.
   - Refresh the page on an inner route to ensure `vercel.json` rewrites are working without 404s.

---

## 6. Troubleshooting & FAQs

- **Cookies not saved on frontend**:
  Ensure `NODE_ENV=production` is set in the backend environment. In production mode, cookies use `SameSite=None` and `Secure=true`, which is required for cross-domain communication between Vercel (`.vercel.app`) and Render (`.onrender.com`).
- **CORS error in browser console**:
  Ensure your exact frontend URL (without trailing slash) is added to `CLIENT_URL` in the backend environment variables.
- **WebSocket connection failed**:
  Ensure `VITE_SOCKET_URL` is set to `https://your-backend-api.onrender.com` (using `https://` or `wss://`). Render and Railway automatically support WebSockets on HTTPS.
