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

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd AgriTrack
   ```

2. **Install All Dependencies**
   ```bash
   npm run install:all
   ```

3. **Environment Setup**
   ```bash
   # Backend environment
   cd backend
   cp env.example .env
   # Edit .env with your configuration
   
   # Frontend environment
   cd ../frontend
   cp env.example .env.local
   # Edit .env.local with your API URL
   ```

4. **Start Development Servers**
   ```bash
   # From root directory - starts both frontend and backend
   npm run dev
   
   # Or start individually:
   # Backend: cd backend && npm run dev
   # Frontend: cd frontend && npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📁 Project Structure

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

## 🔧 Configuration

### Backend Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
MONGO_URI=mongodb://localhost:27017/agritrack

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=24h

# Server
PORT=5000
NODE_ENV=development

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS
FRONTEND_URL=http://localhost:5173
```

### Frontend Environment Variables

Create a `.env.local` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
```

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `POST /api/products/import` - Import products from file
- `GET /api/products/export` - Export products to file

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create transaction

### Reports
- `GET /api/reports/filter-options` - Get report filter options
- `GET /api/reports/recent` - Get recent reports
- `GET /api/reports/:type` - Generate specific report

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## 🚀 Deployment

### Production Deployment

This application is configured for deployment on:
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: MongoDB Atlas
- **File Storage**: Cloudinary

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 📊 Features in Detail

### Dashboard
- Real-time inventory statistics
- Interactive charts and graphs
- Recent activity feed
- Quick action buttons

### Product Management
- Add products with images
- Bulk import from CSV/Excel
- Export data in multiple formats
- Advanced filtering and search
- Category-based organization

### Inventory Tracking
- Real-time stock updates
- Low stock alerts
- Transaction history
- Audit trail

### User Management
- Role-based access control
- User registration and authentication
- Password security
- Activity logging

### Reporting
- Inventory reports
- Transaction reports
- Export to PDF
- Custom date ranges
- Filtering options

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Input validation
- SQL injection prevention
- XSS protection

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment help
- Review the troubleshooting section in the deployment guide

## 🔄 Version History

- **v1.0.0** - Initial release with core features
- Production-ready with deployment configurations
- Comprehensive documentation and guides

---

Built with ❤️ for agricultural inventory management 