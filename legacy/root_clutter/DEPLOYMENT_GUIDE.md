# PowerLift AI Deployment Guide

## Overview
This guide covers deploying the PowerLift AI application with:
- **Frontend**: React/Vite app on Vercel
- **Backend**: Node.js/Express API on Render

---

## 🚀 Backend Deployment (Render)

### 1. Prepare Backend
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment variables
cp .env.example .env
# Edit .env with your actual values
```

### 2. Deploy to Render
1. Go to [render.com](https://render.com) and create an account
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure deployment:
   - **Name**: `powerlift-ai-backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free` (or paid for better performance)
5. Add Environment Variables in Render dashboard:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - Add all API keys and Firebase config
6. Click "Create Web Service"
7. Wait for deployment - you'll get a URL like `https://powerlift-ai-backend.onrender.com`

### 3. Update CORS
In your backend `.env`, add:
```
ALLOWED_ORIGINS=https://your-frontend-url.vercel.app
```

---

## 🎨 Frontend Deployment (Vercel)

### 1. Prepare Frontend
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Update production API URL
# Edit .env.production and frontend/src/config/api.js
# Replace 'your-backend-url.onrender.com' with your actual Render URL
```

### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and create an account
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Root Directory**: `frontend`
5. Add Environment Variables:
   - `VITE_API_BASE_URL`: `https://your-backend-url.onrender.com`
6. Click "Deploy"
7. Wait for deployment - you'll get a URL like `https://powerlift-ai-frontend.vercel.app`

---

## 🔧 Post-Deployment Configuration

### 1. Update CORS Settings
In your Render dashboard, update the `ALLOWED_ORIGINS` environment variable:
```
ALLOWED_ORIGINS=https://your-frontend-url.vercel.app
```

### 2. Test the Application
1. Visit your Vercel frontend URL
2. Test all API endpoints
3. Verify authentication works
4. Test file uploads and other features

### 3. Monitor and Debug
- **Render Logs**: Check your Render service logs for any errors
- **Vercel Logs**: Check Vercel function logs for API call issues
- **Browser Console**: Check for frontend JavaScript errors

---

## 📋 Environment Variables Checklist

### Backend (.env)
- [ ] `NODE_ENV=production`
- [ ] `PORT=10000`
- [ ] `FIREBASE_PROJECT_ID`
- [ ] `FIREBASE_CLIENT_EMAIL`
- [ ] `FIREBASE_PRIVATE_KEY`
- [ ] `GOOGLE_AI_API_KEY`
- [ ] `GROQ_API_KEY`
- [ ] `ALLOWED_ORIGINS=https://your-frontend-url.vercel.app`

### Frontend (.env.production)
- [ ] `VITE_API_BASE_URL=https://your-backend-url.onrender.com`

---

## 🔄 CI/CD Pipeline

Both platforms automatically deploy when you push to your main branch:
1. Push changes to GitHub
2. Render builds and deploys backend
3. Vercel builds and deploys frontend
4. Updates are live within minutes

---

## 🐛 Common Issues

### Backend Issues
- **Port conflicts**: Ensure backend uses port 10000 (Render's required port)
- **Environment variables**: Double-check all required variables are set
- **CORS errors**: Verify frontend URL is in ALLOWED_ORIGINS

### Frontend Issues
- **API calls failing**: Check VITE_API_BASE_URL is correct
- **Build errors**: Ensure all dependencies are installed
- **Routing issues**: Vercel should handle SPA routing automatically

---

## 💡 Pro Tips

1. **Custom Domains**: Both Vercel and Render support custom domains
2. **Performance**: Consider upgrading to paid plans for better performance
3. **Monitoring**: Set up uptime monitoring for your backend
4. **Backups**: Regularly backup your database and important files
5. **Security**: Use HTTPS everywhere and secure your API keys

---

## 📞 Support

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **GitHub Issues**: Check repository for known issues

---

*Your PowerLift AI application is now live! 🎉*
