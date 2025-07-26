# AgriTrack Deployment Guide

This guide will help you deploy AgriTrack to production using Vercel (frontend) and Render (backend).

## Prerequisites

1. **MongoDB Atlas Account** - For production database
2. **Cloudinary Account** - For image uploads
3. **Vercel Account** - For frontend deployment
4. **Render Account** - For backend deployment
5. **GitHub Repository** - To connect your code

## Backend Deployment (Render)

### 1. Prepare MongoDB Atlas

1. Create a MongoDB Atlas account at [mongodb.com](https://mongodb.com)
2. Create a new cluster (free tier is fine)
3. Create a database user with read/write permissions
4. Get your connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/agritrack?retryWrites=true&w=majority
   ```

### 2. Prepare Cloudinary

1. Create a Cloudinary account at [cloudinary.com](https://cloudinary.com)
2. Get your credentials from the dashboard:
   - Cloud Name
   - API Key
   - API Secret

### 3. Deploy to Render

1. **Connect Repository**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `backend` folder as the root directory

2. **Configure Environment Variables**
   ```
   NODE_ENV=production
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/agritrack?retryWrites=true&w=majority
   JWT_SECRET=your_very_long_random_secret_key_here
   JWT_EXPIRE=24h
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   FRONTEND_URL=https://your-frontend-app.vercel.app
   ```

3. **Build Settings**
   - Build Command: `npm install`
   - Start Command: `npm start`

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note your backend URL: `https://your-backend-app.onrender.com`

## Frontend Deployment (Vercel)

### 1. Deploy to Vercel

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Set the root directory to `frontend`

2. **Configure Environment Variables**
   ```
   VITE_API_URL=https://your-backend-app.onrender.com/api
   ```

3. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Note your frontend URL: `https://your-frontend-app.vercel.app`

### 2. Update Backend CORS

After getting your frontend URL, update the backend environment variable:
```
FRONTEND_URL=https://your-frontend-app.vercel.app
```

## Environment Variables Reference

### Backend (Render)
| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for JWT tokens | `your_secret_key` |
| `JWT_EXPIRE` | JWT token expiration | `24h` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `your_api_key` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `your_api_secret` |
| `FRONTEND_URL` | Frontend application URL | `https://your-app.vercel.app` |

### Frontend (Vercel)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://your-backend.onrender.com/api` |

## Security Considerations

1. **JWT Secret**: Use a strong, random string (at least 32 characters)
2. **MongoDB**: Use a strong password and enable network access restrictions
3. **Environment Variables**: Never commit sensitive data to your repository
4. **CORS**: Only allow your frontend domain in production

## Testing Your Deployment

1. **Health Check**: Visit `https://your-backend-app.onrender.com/health`
2. **Frontend**: Visit your Vercel URL and test the application
3. **API Calls**: Check browser console for any CORS or connection errors

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure `FRONTEND_URL` is set correctly in backend
   - Check that the frontend URL is in the CORS allowed origins

2. **Database Connection**
   - Verify MongoDB Atlas network access allows connections from anywhere (0.0.0.0/0)
   - Check that the connection string is correct

3. **Environment Variables**
   - Ensure all required variables are set in both Vercel and Render
   - Check that variable names match exactly (case-sensitive)

4. **Build Errors**
   - Check the build logs in both Vercel and Render
   - Ensure all dependencies are in package.json

### Getting Help

- Check the deployment logs in both platforms
- Verify all environment variables are set correctly
- Test API endpoints using tools like Postman
- Check browser console for frontend errors

## Maintenance

1. **Database Backups**: Set up regular MongoDB Atlas backups
2. **Monitoring**: Use Render and Vercel's built-in monitoring
3. **Updates**: Regularly update dependencies and security patches
4. **Logs**: Monitor application logs for errors and performance issues 