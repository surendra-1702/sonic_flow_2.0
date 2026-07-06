# SonicFlow

A full-stack music streaming application inspired by Spotify, built with Node.js, Express, MongoDB, and Vanilla JavaScript. Designed for deployment on Vercel.

## Features

- **Music Player** — Play, pause, seek, volume control, shuffle, repeat, keyboard shortcuts
- **Authentication** — Register, login, JWT-based secure sessions
- **Song Library** — Browse all songs with search and filtering
- **Playlists** — Create, rename, delete playlists with add/remove songs
- **Favorites** — Like and unlike songs, view all favorites
- **Queue** — Add songs to queue, reorder, remove
- **Recently Played** — Automatic listening history tracking
- **Artist & Album Pages** — Dedicated pages with all related songs
- **Responsive Design** — Works on desktop, tablet, and mobile
- **Dark Mode UI** — Premium streaming aesthetic with glassmorphism effects

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript (ES6) |
| Backend | Node.js, Express.js |
| Database | MongoDB (Atlas) |
| Audio | Cloudinary (direct streaming) |
| Authentication | JWT + bcryptjs |
| Deployment | Vercel (serverless) |

## Screenshots

*(Screenshots to be added)*

## Folder Structure

```
sonicflow/
├── api/
│   └── index.js              # Vercel serverless entry point
├── src/
│   ├── app.js                # Express app factory
│   ├── server.js             # Local development server
│   ├── config/
│   │   └── db.js             # MongoDB connection (serverless-optimized)
│   ├── models/               # Mongoose schemas
│   │   ├── User.js
│   │   ├── Song.js
│   │   ├── Artist.js
│   │   ├── Album.js
│   │   ├── Playlist.js
│   │   ├── Favorite.js
│   │   ├── ListeningHistory.js
│   │   └── Queue.js
│   ├── routes/               # Express route definitions
│   ├── controllers/          # Route handler logic
│   ├── middleware/
│   │   ├── auth.js           # JWT authentication
│   │   ├── validate.js       # Request validation
│   │   └── errorHandler.js   # Centralized error handling
│   └── utils/
│       └── helpers.js        # Utility functions
├── public/
│   ├── index.html            # SPA entry point
│   ├── 404.html
│   ├── css/                  # Stylesheets
│   ├── js/                   # Frontend JavaScript
│   └── images/               # Static assets
├── seeds/
│   └── seed.js               # Database sync script
├── songs.url                 # Song data (pipe-delimited: title | artist | album | genre | duration | coverImage | audioUrl | releaseYear)
├── vercel.json               # Vercel deployment config
├── .env.example              # Environment variable template
├── .gitignore
├── package.json
└── README.md
```

## Prerequisites

- **Node.js** v18 or later
- **npm** v9 or later
- **MongoDB Atlas** account (free tier)
- **Cloudinary** account (for audio files)
- **Git** (for version control)

## MongoDB Atlas Setup

### Step 1: Create an Account

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Click **"Try Free"** and sign up with your email or Google account
3. Complete the onboarding wizard

### Step 2: Create a Free Cluster

1. After logging in, click **"Build a Database"**
2. Select the **FREE (M0)** shared cluster tier
3. Choose a cloud provider (AWS) and region closest to you
4. Click **"Create Cluster"** (takes 1-3 minutes to provision)

### Step 3: Create a Database User

1. In the left sidebar, go to **Security → Database Access**
2. Click **"Add New Database User"**
3. Set:
   - **Authentication Method:** Password
   - **Username:** `sonicflow_user` (or your preference)
   - **Password:** Generate a strong password (save this securely)
   - **Built-in Role:** `Read and write to any database`
4. Click **"Add User"**

### Step 4: Whitelist IP Addresses

1. Go to **Security → Network Access**
2. Click **"Add IP Address"**
3. For development: add your current IP
4. For Vercel deployment: add `0.0.0.0/0` (allows access from anywhere — required for serverless)
5. Click **"Confirm"**

### Step 5: Get the Connection String

1. Go to **Deployment → Database → Connect**
2. Click **"Drivers"**
3. Copy the connection string:
   ```
   mongodb+srv://sonicflow_user:<password>@cluster0.xxxxx.mongodb.net/sonicflow?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your database user's password
5. Replace `sonicflow` with your preferred database name

### Step 6: Configure Environment Variable

1. Copy `.env.example` to `.env`
2. Set `MONGODB_URI` to your connection string

### Step 7: Test the Connection

```bash
node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => { console.log('Connected!'); process.exit(0); }).catch(e => { console.error(e); process.exit(1); });"
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MONGODB_URI` | Yes | — | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | — | Secret key for JWT signing |
| `CLOUDINARY_CLOUD_NAME` | No | `dxhlh9xfn` | Cloudinary cloud name |
| `CLIENT_URL` | Yes | `http://localhost:5000` | Allowed CORS origin |
| `NODE_ENV` | No | `development` | Environment mode |
| `PORT` | No | `5000` | Local development port |
| `SONGS_URL_PATH` | No | `songs.url` | Path to the songs file (relative to project root or absolute) |

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/sonicflow.git
cd sonicflow
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your MongoDB Atlas connection string and a secure JWT secret:

```bash
MONGODB_URI=mongodb+srv://sonicflow_user:yourpassword@cluster0.xxxxx.mongodb.net/sonicflow?retryWrites=true&w=majority
JWT_SECRET=your_generated_secret_here
```

Generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Seed the Database

```bash
npm run seed
```

This reads `songs.url` and `seeds/songs.metadata.json`, then creates Artists, Albums, and Songs in your MongoDB Atlas database.

### 5. Start the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5000`.

## Seeding the Database

The seed script (`seeds/seed.js`) is now a **sync tool** that imports songs from the single `songs.url` file.

The `songs.url` file uses a pipe-delimited format:

```text
title | artist | album | genre | duration | coverImage | cloudinaryAudioUrl | releaseYear
```

**Example line:**

```text
My Song Title | Artist Name | Album Title | Pop | 240 | https://picsum.photos/seed/cover/300/300 | https://res.cloudinary.com/xxx/video/upload/v1/songs/song.mp3 | 2026
```

The sync process:

1. Reads and parses `songs.url`
2. Computes an MD5 hash — if the file hasn't changed since the last sync, it skips immediately
3. For each valid entry:
   - Creates the **Artist** if it doesn't exist
   - Creates the **Album** if it doesn't exist
   - Links the **Song** to the correct Artist and Album
4. Tracks new imports, metadata updates, duplicates skipped, and invalid entries
5. Stores the file hash in MongoDB for quick change detection on future runs

### Duplicate Detection

A song is considered a duplicate if **`title` + `artist`** match an existing song in the database:

- **Title + Artist match, no metadata change** → skipped
- **Title + Artist match, metadata changed** → updated
- **No match** → imported as new

Artist and Album creation uses `findOne` then `create` — idempotent and safe to run repeatedly.

### Running the Sync

```bash
npm run seed
```

### Auto-Sync on Development Startup

When running locally with `npm run dev`, the sync runs automatically after the database connects. You'll see a summary in the console:

```text
[sync] 48 records | 2 new | 0 updated | 46 skipped | 0 invalid
```

If no changes are detected:

```text
[sync] No changes detected (last sync: Mon Jul 06 2026)
```

### Production Sync (Vercel)

In production, the sync does **not** run automatically. To trigger a sync on your deployed instance:

```bash
curl -X POST https://your-project.vercel.app/api/songs/sync \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

This endpoint is protected — you must be logged in with a valid JWT token.

### Adding New Songs

To add songs to your library:

1. **Upload the audio** to Cloudinary
2. **Add a line** to `songs.url` in the pipe-delimited format
3. **Run the sync** (`npm run seed` locally, or `POST /api/songs/sync` in production)

The sync will:
- Create any new Artist / Album records
- Import only the new songs (existing ones are untouched unless metadata changed)
- Print a summary of what happened

## Deploying to Vercel

### Prerequisites

- A [Vercel](https://vercel.com) account
- A MongoDB Atlas cluster (steps above)
- Your project pushed to a GitHub repository

### Deployment Steps

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/sonicflow.git
   git push -u origin main
   ```

2. **Import to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click **"Add New → Project"**
   - Import your GitHub repository
   - Framework preset: **Other**

3. **Configure Environment Variables:**
   In the Vercel project settings, add:
   | Variable | Value |
   |----------|-------|
   | `MONGODB_URI` | Your Atlas connection string |
   | `JWT_SECRET` | Your secure secret |
   | `CLOUDINARY_CLOUD_NAME` | `dxhlh9xfn` |
   | `CLIENT_URL` | `https://your-project.vercel.app` |
   | `NODE_ENV` | `production` |

4. **Deploy:**
   - Click **"Deploy"**
   - Vercel automatically detects `vercel.json` and uses the correct configuration

5. **Seed the Production Database:**
   After deployment, run the seed script locally pointing to your production database:
   ```bash
   NODE_ENV=production npm run seed
   ```
   Or use a Vercel CLI one-time command.

### Updating Cloudinary Song URLs

To update song URLs after deployment:

1. Edit entries in `songs.url` (update the audio URL or any metadata field)
2. Run `npm run seed` to sync changes to MongoDB
3. The sync detects changes by MD5 hash and updates only what changed

## API Documentation

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login and receive JWT |
| GET | `/api/auth/me` | Yes | Get current user profile |

**POST /api/auth/register**

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**POST /api/auth/login**

```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

### Songs

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/songs` | No | Get all songs (paginated) |
| GET | `/api/songs/search?q=` | No | Search songs by title, artist, album |
| POST | `/api/songs/sync` | Yes | Sync songs from `songs.url` (production trigger) |
| GET | `/api/songs/:id` | No | Get a single song |

### Artists

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/artists` | No | Get all artists |
| GET | `/api/artists/:id` | No | Get artist details with songs |

### Albums

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/albums` | No | Get all albums |
| GET | `/api/albums/:id` | No | Get album details with tracks |

### Playlists

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/playlists` | Yes | Get user's playlists |
| POST | `/api/playlists` | Yes | Create a playlist |
| PUT | `/api/playlists/:id` | Yes | Rename a playlist |
| DELETE | `/api/playlists/:id` | Yes | Delete a playlist |
| POST | `/api/playlists/:id/songs` | Yes | Add song to playlist |
| DELETE | `/api/playlists/:id/songs/:songId` | Yes | Remove song from playlist |

### Favorites

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/favorites` | Yes | Get user's favorites |
| POST | `/api/favorites/:songId` | Yes | Add song to favorites |
| DELETE | `/api/favorites/:songId` | Yes | Remove song from favorites |

### History

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/history` | Yes | Get recently played songs |
| POST | `/api/history` | Yes | Add song to history |

### Queue

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/queue` | Yes | Get user's queue |
| POST | `/api/queue` | Yes | Add song to queue |
| PUT | `/api/queue/reorder` | Yes | Reorder queue |
| DELETE | `/api/queue/:songId` | Yes | Remove song from queue |

### Authentication Header

Protected routes require a Bearer token:

```
Authorization: Bearer <your_jwt_token>
```

## Troubleshooting

### MongoDB Connection Errors

**"MONGODB_URI is not defined"**
- Ensure `.env` file exists and contains `MONGODB_URI`
- Do not commit `.env` to version control

**"Authentication failed"**
- Verify database username and password in the connection string
- Ensure the database user has read/write permissions
- Check that your IP is whitelisted (or `0.0.0.0/0` for production)

**"getaddrinfo ENOTFOUND"**
- Check your cluster name in the connection string
- Ensure the Atlas cluster is running (not paused)

### Vercel Deployment Issues

**"Function timed out"**
- Increase `maxDuration` in `vercel.json` (max 30s on Hobby plan)
- Optimize MongoDB queries with proper indexes

**"CORS error"**
- Ensure `CLIENT_URL` matches your Vercel deployment domain exactly
- Include protocol (https://) and no trailing slash

### Seed Script Issues

**"songs.url not found..."**
- Ensure `songs.url` exists in the project root
- If using a custom path, verify `SONGS_URL_PATH` in your environment variables
- The file must use the pipe-delimited format: `title | artist | album | genre | duration | coverImage | audioUrl | releaseYear`

**"Sync failed — invalid line..."**
- Each line in `songs.url` must have at least 7 pipe-delimited fields
- Duration must be a positive number (seconds)
- Title and audio URL are required fields

## Future Enhancements

- User profile pages with avatars
- Social features (share playlists, follow users)
- Podcast support
- Audio visualizer
- Collaborative playlists
- Offline mode
- Mobile app (React Native)
- Recommendations engine
- Lyrics display

## License

MIT
