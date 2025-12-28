# Setup Guide

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

## Step-by-Step Setup

### 1. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file (copy from .env.example)
# Windows: copy .env.example .env
# Mac/Linux: cp .env.example .env

# Edit .env file with your MongoDB connection string
# For local MongoDB: mongodb://localhost:27017/whatsapp-chat
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/whatsapp-chat

# Start the server (development mode with auto-reload)
npm run dev

# Or start in production mode
npm start
```

The server will run on `http://localhost:5000`

### 2. Frontend Setup

```bash
# Navigate to client directory (in a new terminal)
cd client

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:5173`

### 3. MongoDB Setup

#### Option A: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/whatsapp-chat`

#### Option B: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string and update `.env` file

### 4. Environment Variables

Create `server/.env` file with:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key_change_this
CLIENT_URL=http://localhost:5173
```

### 5. Testing the Application

1. Start the backend server
2. Start the frontend server
3. Open `http://localhost:5173` in your browser
4. Create a new account or login
5. Start chatting!

## Troubleshooting

### MongoDB Connection Issues

- Ensure MongoDB is running (if using local)
- Check your connection string in `.env`
- Verify network access (for Atlas)

### Port Already in Use

- Change `PORT` in `server/.env`
- Update `CLIENT_URL` if you change the port

### CORS Issues

- Ensure `CLIENT_URL` in backend matches your frontend URL
- Check that both servers are running

## Development Tips

- Use `npm run dev` for auto-reload during development
- Check browser console and server logs for errors
- MongoDB Compass is helpful for viewing database data

