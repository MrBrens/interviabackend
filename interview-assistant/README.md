# Interv-ia - AI Interview Preparation Platform

A comprehensive AI-powered interview preparation platform with real-time chat simulation, document analysis, and payment integration.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MySQL Database
- Stripe Account (for payments)

### Frontend (Next.js)

1. **Navigate to frontend directory:**
   ```bash
   cd interview-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5050
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

### Backend (Node.js/Express)

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file:
   ```env
   JWT_SECRET=your_jwt_secret_here
   DB_HOST=your_database_host
   DB_PORT=3306
   DB_NAME=intervia
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   STRIPE_SECRET_KEY=your_stripe_secret_key
   PORT=5050
   NODE_ENV=production
   CORS_ORIGINS=http://localhost:3000,https://your-frontend-domain.vercel.app
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

## 🌐 Deployment

### Frontend Deployment (Vercel)

1. **Push to GitLab:**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Deploy to Vercel:**
   - Connect your GitLab repository to Vercel
   - Set environment variables in Vercel dashboard:
     - `NEXT_PUBLIC_API_URL`: Your backend API URL
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key

3. **Build Settings:**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### Backend Deployment

#### Option 1: Railway/Render/Heroku
1. Connect your GitLab repository
2. Set environment variables
3. Deploy

#### Option 2: VPS/Server
1. Clone repository
2. Install dependencies
3. Set up environment variables
4. Use PM2 or similar for process management

## 🔧 Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_key_here
```

### Backend (.env)
```env
JWT_SECRET=your_very_long_random_secret
DB_HOST=your_database_host
DB_PORT=3306
DB_NAME=intervia
DB_USER=your_db_user
DB_PASSWORD=your_db_password
STRIPE_SECRET_KEY=sk_live_your_key_here
PORT=5050
NODE_ENV=production
CORS_ORIGINS=https://your-frontend-domain.vercel.app
```

## 📁 Project Structure

```
interview-assistant/
├── interview-frontend/          # Next.js Frontend
│   ├── src/
│   │   ├── app/                # App Router pages
│   │   ├── components/         # Reusable components
│   │   ├── config/            # Configuration files
│   │   └── utils/             # Utility functions
│   ├── public/                # Static assets
│   └── package.json
├── backend/                   # Node.js/Express Backend
│   ├── config/               # Database configuration
│   ├── controllers/          # Route controllers
│   ├── models/              # Sequelize models
│   ├── routes/              # API routes
│   ├── middleware/          # Custom middleware
│   └── package.json
└── README.md
```

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Environment variable configuration
- Input validation and sanitization

## 💳 Payment Integration

- Stripe payment processing
- Subscription management
- Secure payment handling

## 🗄️ Database

- MySQL database with Sequelize ORM
- User management
- Discussion history
- Payment records
- Subscription tracking

## 🚀 Features

- AI-powered interview simulation
- Real-time chat interface
- Document upload and analysis
- User authentication and authorization
- Payment processing
- Admin dashboard
- Responsive design

## 📝 License

ISC License

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For support, email support@interv-ia.com or create an issue in the repository. 