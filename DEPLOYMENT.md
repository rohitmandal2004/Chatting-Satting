# Production Deployment Guide

## 🚀 Complete Deployment Instructions

This guide will help you deploy **Chating Buddy** to production on Vercel (Frontend) and Render/Railway (Backend).

---

## 📋 Prerequisites

1. **GitHub Account** - For version control
2. **Vercel Account** - For frontend deployment (free tier available)
3. **Render/Railway Account** - For backend deployment (free tier available)
4. **MongoDB Atlas Account** - For cloud database (free tier available)
5. **Cloudinary Account** - For image uploads (free tier available)

---

## 🔧 Step 1: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user (username & password)
4. Whitelist IP addresses (use `0.0.0.0/0` for all IPs in development)
5. Get your connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/Chating-Satting
   ```

---

## 🖼️ Step 2: Set Up Cloudinary

1. Go to [Cloudinary](https://cloudinary.com)
2. Sign up for free account
3. Go to Dashboard → Settings
4. Copy:
   - Cloud Name
   - API Key
   - API Secret

---

## 🔙 Step 3: Deploy Backend (Render/Railway)

### Option A: Render

1. Go to [Render](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `chating-buddy-api`
   - **Environment**: `Node`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Root Directory**: Leave empty

5. Add Environment Variables:
   ```
   PORT=10000
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/Chating-Satting
   JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long
   CLIENT_URL=https://your-frontend.vercel.app
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

6. Click "Create Web Service"
7. Wait for deployment (5-10 minutes)
8. Copy your backend URL: `https://your-app.onrender.com`

### Option B: Railway

1. Go to [Railway](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Add environment variables (same as Render)
5. Set root directory to `server`
6. Deploy

---

## 🎨 Step 4: Deploy Frontend (Vercel)

1. Go to [Vercel](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add Environment Variables:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   VITE_SOCKET_URL=https://your-backend.onrender.com
   ```

6. Click "Deploy"
7. Wait for deployment (2-3 minutes)
8. Copy your frontend URL: `https://your-app.vercel.app`

---

## 🔄 Step 5: Update Backend CORS

After frontend is deployed, update backend environment variable:

```
CLIENT_URL=https://your-frontend.vercel.app
```

Redeploy backend to apply changes.

---

## ✅ Step 6: Verify Deployment

1. **Frontend**: Visit `https://your-app.vercel.app`
2. **Backend**: Visit `https://your-backend.onrender.com` (should show API message)
3. **Test Features**:
   - Sign up new account
   - Upload profile picture
   - Send messages
   - Check real-time updates

---

## 🐛 Troubleshooting

### CORS Errors
- Ensure `CLIENT_URL` in backend includes your Vercel URL
- Check for trailing slashes in URLs
- Verify environment variables are set correctly

### Socket.IO Not Connecting
- Check `VITE_SOCKET_URL` in frontend
- Ensure backend allows WebSocket connections
- Check browser console for connection errors

### Image Upload Fails
- Verify Cloudinary credentials
- Check file size limits (5MB max)
- Ensure CORS allows file uploads

### Database Connection Issues
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check connection string format
- Ensure database user has proper permissions

---

## 📝 Environment Variables Summary

### Backend (.env)
```env
PORT=10000
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
CLIENT_URL=https://your-frontend.vercel.app
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend (Vercel Environment Variables)
```env
VITE_API_URL=https://your-backend.onrender.com/api
VITE_SOCKET_URL=https://your-backend.onrender.com
```

---

## 🎯 Production Checklist

- [ ] MongoDB Atlas cluster created and accessible
- [ ] Cloudinary account set up with credentials
- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Environment variables configured
- [ ] CORS properly configured
- [ ] Socket.IO working in production
- [ ] Profile picture upload working
- [ ] Real-time messaging working
- [ ] Multiple users can chat simultaneously

---

## 🔒 Security Best Practices

1. **JWT Secret**: Use a strong, random string (min 32 characters)
2. **MongoDB**: Use strong password, limit IP access in production
3. **CORS**: Only allow your frontend domain
4. **Environment Variables**: Never commit `.env` files
5. **HTTPS**: Always use HTTPS in production

---

## 📞 Support

If you encounter issues:
1. Check deployment logs in Render/Vercel
2. Check browser console for errors
3. Verify all environment variables are set
4. Ensure all services are running

---

**Your app is now production-ready! 🎉**

