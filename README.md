# AgriTrack - Agricultural Inventory Management System

A comprehensive inventory management system designed specifically for agricultural products, built with React frontend and Node.js backend.

## 🌟 Features

- **Product Management**: Add, edit, delete, and track agricultural products
- **Inventory Tracking**: Real-time stock level monitoring
- **Transaction History**: Complete audit trail of all inventory movements
- **User Management**: Role-based access control
- **Reporting**: Comprehensive reports and analytics
- **Data Import/Export**: CSV and Excel file support
- **Image Upload**: Product image management with Cloudinary
- **Real-time Dashboard**: Live statistics and charts
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Complete Setup Guide for New PC/Laptop

This guide will walk you through setting up AgriTrack on a completely new computer. Follow each step carefully to ensure a successful installation.

### 📋 Prerequisites Check

Before starting, ensure your system meets these requirements:

#### 1. **Node.js Installation**
- **Required Version**: Node.js v16 or higher
- **Check if installed**: Open terminal/command prompt and run:
  ```bash
  node --version
  npm --version
  ```
- **If not installed**: Download from [nodejs.org](https://nodejs.org/)
  - Choose the LTS (Long Term Support) version
  - Run the installer and follow the setup wizard
  - Restart your terminal after installation

#### 2. **Git Installation**
- **Check if installed**: Run in terminal:
  ```bash
  git --version
  ```
- **If not installed**: Download from [git-scm.com](https://git-scm.com/)
  - Run the installer with default settings
  - Restart your terminal after installation

#### 3. **Code Editor (Recommended)**
- **VS Code**: Download from [code.visualstudio.com](https://code.visualstudio.com/)
- **Alternative**: Any text editor that supports JavaScript/React

#### 4. **MongoDB Setup**
You have two options:

**Option A: MongoDB Atlas (Cloud - Recommended for beginners)**
- Go to [mongodb.com](https://mongodb.com)
- Create a free account
- Create a new cluster (free tier)
- Get your connection string (we'll use this later)

**Option B: Local MongoDB**
- Download MongoDB Community Server from [mongodb.com](https://mongodb.com)
- Install with default settings
- Start MongoDB service

### 🔧 Step-by-Step Installation

#### Step 1: Download the Project
```bash
# Open terminal/command prompt
# Navigate to where you want to install the project
cd C:\Users\YourUsername\Desktop  # Windows
# OR
cd ~/Desktop  # Mac/Linux

# Clone the repository
git clone <your-repo-url>
cd AgriTrack

# Verify the project structure
dir  # Windows
# OR
ls   # Mac/Linux
```

**Expected Output**: You should see folders like `backend`, `frontend`, and files like `package.json`, `README.md`

#### Step 2: Install Dependencies
```bash
# Install all dependencies (this may take 5-10 minutes)
npm run install:all
```

**What this does**: Installs Node.js packages for the root project, backend, and frontend

**Expected Output**: You should see installation progress for all three directories without errors

#### Step 3: Environment Configuration

##### Backend Configuration
```bash
# Navigate to backend directory
cd backend

# Copy the environment template
copy env.example .env  # Windows
# OR
cp env.example .env    # Mac/Linux

# Open the .env file in your code editor
code .env
```

**Edit the `.env` file with your settings:**

```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/agritrack

# JWT Configuration
JWT_SECRET=your_super_secret_key_here_make_it_long_and_random
JWT_EXPIRE=24h

# Server Configuration
PORT=5000
NODE_ENV=development

# Cloudinary Configuration (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

**Important Notes:**
- **MONGO_URI**: If using MongoDB Atlas, replace with your connection string
- **JWT_SECRET**: Generate a random string (at least 32 characters)
- **Cloudinary**: Create free account at [cloudinary.com](https://cloudinary.com) for image uploads

##### Frontend Configuration
```bash
# Navigate to frontend directory
cd ../frontend

# Copy the environment template
copy env.example .env.local  # Windows
# OR
cp env.example .env.local    # Mac/Linux

# Open the .env.local file in your code editor
code .env.local
```

**Edit the `.env.local` file:**
```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Google reCAPTCHA (optional)
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

#### Step 4: Start the Application
```bash
# Return to the root directory
cd ..

# Start both frontend and backend servers
npm run dev
```

**Expected Output**: You should see:
- Backend server starting on port 5000
- Frontend server starting on port 5173
- Both servers running without errors

#### Step 5: Access the Application
Open your web browser and navigate to:
- **Frontend Application**: http://localhost:5173
- **Backend API**: http://localhost:5000

### ✅ Verification Steps

#### 1. **Check Backend Health**
Visit: http://localhost:5000/health
**Expected**: Should show a success message or API status

#### 2. **Check Frontend**
Visit: http://localhost:5173
**Expected**: Should show the AgriTrack login page

#### 3. **Database Connection**
- Check your terminal for any database connection errors
- If using MongoDB Atlas, ensure your IP is whitelisted

### 🛠️ Troubleshooting Common Issues

#### Issue 1: "npm command not found"
**Solution**: 
- Reinstall Node.js from [nodejs.org](https://nodejs.org/)
- Restart your terminal after installation
- Verify with `node --version` and `npm --version`

#### Issue 2: "Port already in use"
**Solution**:
```bash
# Windows - Find process using port 5000
netstat -ano | findstr :5000
# Kill the process (replace XXXX with the PID)
taskkill /PID XXXX /F

# Mac/Linux - Find process using port 5000
lsof -i :5000
# Kill the process
kill -9 <PID>
```

#### Issue 3: "MongoDB connection failed"
**Solutions**:
- **Local MongoDB**: Ensure MongoDB service is running
- **MongoDB Atlas**: Check your connection string and IP whitelist
- **Network**: Check your internet connection

#### Issue 4: "Module not found" errors
**Solution**:
```bash
# Reinstall dependencies
npm run install:all
```

#### Issue 5: "Permission denied" errors
**Solution**:
- **Windows**: Run terminal as Administrator
- **Mac/Linux**: Use `sudo` if necessary, or fix file permissions

### 🔧 Development Commands

Once setup is complete, you can use these commands:

```bash
# Start both servers (development mode)
npm run dev

# Start only backend
npm run dev:backend

# Start only frontend
npm run dev:frontend

# Build for production
npm run build

# Start production server
npm start
```

### 📁 Project Structure

```
AgriTrack/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── config/         # Configuration files
│   │   └── utils/          # Utility functions
│   ├── uploads/            # File uploads
│   └── package.json
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── config/        # Configuration
│   │   └── assets/        # Static assets
│   └── package.json
└── README.md
```

### 🛠️ API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

#### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `POST /api/products/import` - Import products from file
- `GET /api/products/export` - Export products to file

#### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create transaction

#### Reports
- `GET /api/reports/filter-options` - Get report filter options
- `GET /api/reports/recent` - Get recent reports
- `GET /api/reports/:type` - Generate specific report

#### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### 🚀 Deployment

For production deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### 📊 Features in Detail

#### Dashboard
- Real-time inventory statistics
- Interactive charts and graphs
- Recent activity feed
- Quick action buttons

#### Product Management
- Add products with images
- Bulk import from CSV/Excel
- Export data in multiple formats
- Advanced filtering and search
- Category-based organization

#### Inventory Tracking
- Real-time stock updates
- Low stock alerts
- Transaction history
- Audit trail

#### User Management
- Role-based access control
- User registration and authentication
- Password security
- Activity logging

#### Reporting
- Inventory reports
- Transaction reports
- Export to PDF
- Custom date ranges
- Filtering options

### 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Input validation
- SQL injection prevention
- XSS protection

### 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### 🤝 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment help
- Review the troubleshooting section above

### 🔄 Version History

- **v1.0.0** - Initial release with core features
- Production-ready with deployment configurations
- Comprehensive documentation and guides

---

**🎉 Congratulations!** If you've followed all steps and can access the application at http://localhost:5173, your AgriTrack setup is complete and ready to use!

Built with ❤️ for agricultural inventory management 