# Vercel Deployment Fix Guide

## 🔴 Problem: 500 Internal Server Error

The error occurs because Vercel is trying to handle `/api/*` routes as serverless functions, but your backend is deployed separately.

## ✅ Solution: Configure Environment Variables

### Step 1: Get Your Backend URL

Your backend should be deployed on:
- **Render**: `https://your-app.onrender.com`
- **Railway**: `https://your-app.railway.app`
- Or any other hosting service

### Step 2: Set Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add these variables:

```
VITE_API_URL = https://your-backend.onrender.com/api
VITE_SOCKET_URL = https://your-backend.onrender.com
```

**Important:**
- Replace `your-backend.onrender.com` with your actual backend URL
- Make sure to include `/api` at the end of `VITE_API_URL`
- Do NOT include `/api` in `VITE_SOCKET_URL`

### Step 3: Redeploy

After adding environment variables:
1. Go to **Deployments** tab
2. Click the **⋯** menu on the latest deployment
3. Click **Redeploy**

Or push a new commit to trigger automatic redeployment.

## 🔍 Verify Configuration

After redeployment, check:

1. **Browser Console** (F12):
   - Should see API calls going to your backend URL
   - No errors about `/api` routes

2. **Network Tab**:
   - API requests should go to: `https://your-backend.onrender.com/api/*`
   - Socket connection should go to: `https://your-backend.onrender.com`

## 🐛 Common Issues

### Issue 1: Still getting 500 errors
- **Fix**: Make sure environment variables are set for **Production** environment
- Check that backend URL is correct and accessible

### Issue 2: CORS errors
- **Fix**: Update backend `CLIENT_URL` to include your Vercel URL:
  ```
  CLIENT_URL=https://your-frontend.vercel.app
  ```

### Issue 3: Socket.IO not connecting
- **Fix**: Ensure `VITE_SOCKET_URL` is set correctly (without `/api`)
- Check backend Socket.IO CORS configuration

## 📝 Quick Checklist

- [ ] Backend deployed and accessible
- [ ] `VITE_API_URL` set in Vercel (with `/api`)
- [ ] `VITE_SOCKET_URL` set in Vercel (without `/api`)
- [ ] Backend `CLIENT_URL` includes Vercel URL
- [ ] Redeployed after setting variables
- [ ] Tested in browser console

## 🎯 Expected Result

After configuration:
- ✅ No 500 errors
- ✅ API calls work correctly
- ✅ Socket.IO connects
- ✅ App functions normally

---

**Note**: The `vercel.json` file has been created to handle routing. The main fix is setting the environment variables correctly.

