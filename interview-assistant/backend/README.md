# Interview Assistant Backend API

A Node.js/Express backend API for the Interview Assistant application.

## Features

- User authentication and authorization
- Admin dashboard management
- Payment processing with Stripe
- Subscription management
- Chat and meeting functionality
- Database integration

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory with the following variables:
   ```env
   # Database
   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=interview_assistant
   DB_PORT=3306

   # JWT Secret
   JWT_SECRET=your_jwt_secret_key

   # Stripe Configuration
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

   # Server Configuration
   PORT=3001
   NODE_ENV=development
   ```

3. **Set up the database:**
   - Create a MySQL database
   - Run the SQL commands from `database.sql`

4. **Start the server:**
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/analytics` - Get analytics data
- `POST /api/admin/plans` - Create subscription plans

### Payments
- `POST /api/payment/create-checkout-session` - Create Stripe checkout session
- `POST /api/payment/webhook` - Stripe webhook handler

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DB_HOST` | Database host | Yes |
| `DB_USER` | Database username | Yes |
| `DB_PASSWORD` | Database password | Yes |
| `DB_NAME` | Database name | Yes |
| `DB_PORT` | Database port | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | Yes |
| `PORT` | Server port | No (default: 3001) |
| `NODE_ENV` | Environment | No (default: development) |

## Security

- All sensitive data (API keys, secrets) are stored in environment variables
- JWT tokens are used for authentication
- Input validation and sanitization
- CORS protection
- Rate limiting (can be added)

## Deployment

This backend can be deployed on:
- Railway
- Render
- Heroku
- DigitalOcean
- AWS/GCP/Azure

Make sure to set all required environment variables in your deployment platform. 