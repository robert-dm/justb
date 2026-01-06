# justB - Complete Setup Guide

This guide will walk you through setting up the justB marketplace from scratch.

## Prerequisites

Before you begin, make sure you have the following installed:

1. **Node.js** (v16 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **MongoDB**
   - Option A: Install locally from https://www.mongodb.com/try/download/community
   - Option B: Use MongoDB Atlas (cloud) - https://www.mongodb.com/cloud/atlas
   - Verify installation: `mongod --version` (if local)

3. **Stripe Account**
   - Sign up at: https://stripe.com
   - You'll use test mode for development

4. **Git** (optional, for version control)
   - Download from: https://git-scm.com/

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Express (web server)
- Mongoose (MongoDB client)
- JWT (authentication)
- Stripe (payments)
- And more...

### 2. Configure Environment Variables

The `.env` file contains your configuration. Update these values:

#### MongoDB Setup

**Option A: Local MongoDB**
```env
MONGODB_URI=mongodb://localhost:27017/justb
```

**Option B: MongoDB Atlas (Cloud)**
1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Click "Connect" and get your connection string
4. Update `.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/justb
```

#### Stripe Setup

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your "Publishable key" and "Secret key"
3. Update `.env`:
```env
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
```

4. For webhooks (optional, for production):
   - Go to https://dashboard.stripe.com/test/webhooks
   - Add endpoint: `http://your-domain.com/api/payments/webhook`
   - Copy the signing secret
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

#### JWT Secret

Generate a secure random string for JWT:
```bash
# On Mac/Linux:
openssl rand -base64 32

# Or use any random string generator
```

Update `.env`:
```env
JWT_SECRET=your-generated-secret-here
```

### 3. Start MongoDB

**If using local MongoDB:**
```bash
# Mac (if installed via Homebrew):
brew services start mongodb-community

# Linux:
sudo systemctl start mongod

# Windows:
# MongoDB should start automatically as a service
```

**If using MongoDB Atlas:**
- No action needed, it's already running in the cloud

### 4. Start the Application

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

You should see:
```
MongoDB Connected: localhost:27017
Server running on port 3000
Frontend: http://localhost:3000
API: http://localhost:3000/api
```

### 5. Open the Application

Visit http://localhost:3000 in your browser

## Testing the Application

### Create Test Accounts

1. **Tourist Account:**
   - Go to http://localhost:3000/register
   - Fill in details and select "Tourist"
   - Login and browse providers

2. **Provider Account:**
   - Go to http://localhost:3000/register
   - Fill in details and select "Breakfast Provider"
   - Login and go to Dashboard
   - Complete your provider profile
   - Add menu items

### Test the Booking Flow

1. Login as a tourist
2. Browse providers at `/providers`
3. Click on a provider
4. Add items to cart
5. Fill in delivery details
6. Proceed to checkout

### Test Stripe Payment

Use these test card numbers:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Any future expiry date (e.g., 12/34)
- Any 3-digit CVC

## Troubleshooting

### MongoDB Connection Issues

**Error: "MongoServerError: Authentication failed"**
- Check your username and password in the connection string
- Ensure the database user has proper permissions

**Error: "MongooseServerSelectionError: connect ECONNREFUSED"**
- MongoDB is not running
- Start MongoDB: `brew services start mongodb-community` (Mac)
- Or check MongoDB Atlas connection string

### Port Already in Use

**Error: "EADDRINUSE: address already in use :::3000"**
```bash
# Find and kill the process using port 3000
# Mac/Linux:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

Or change the port in `.env`:
```env
PORT=3001
```

### Stripe Issues

**Payments not working:**
- Check that STRIPE_SECRET_KEY starts with `sk_test_`
- Check that STRIPE_PUBLISHABLE_KEY starts with `pk_test_`
- Make sure you're using test mode card numbers

### JWT Token Issues

**Error: "jwt malformed" or "invalid token"**
- Clear browser localStorage
- Login again
- Make sure JWT_SECRET is set in `.env`

## Adding Sample Data

### Create Sample Providers

You can create providers through the UI, or use MongoDB directly:

```javascript
// Connect to MongoDB and run:
db.providers.insertOne({
  userId: ObjectId("your-user-id"),
  businessName: "Morning Delights",
  description: "Traditional homemade breakfast from local ingredients",
  cuisine: ["traditional", "continental"],
  serviceType: { delivery: true, pickup: true },
  deliveryRadius: 10,
  deliveryFee: 2.50,
  minimumOrder: 10,
  address: {
    street: "123 Main St",
    city: "San Francisco",
    state: "CA",
    zipCode: "94102",
    country: "USA",
    coordinates: {
      lat: 37.7749,
      lng: -122.4194
    }
  },
  menu: [
    {
      name: "Croissant & Coffee",
      description: "Fresh butter croissant with artisan coffee",
      price: 8.50,
      category: "continental",
      available: true
    },
    {
      name: "Full English Breakfast",
      description: "Eggs, bacon, sausage, beans, toast, tomatoes",
      price: 14.99,
      category: "traditional",
      available: true
    }
  ],
  deliverySlots: [
    { time: "07:00", maxOrders: 10 },
    { time: "08:00", maxOrders: 10 },
    { time: "09:00", maxOrders: 10 }
  ],
  rating: { average: 4.8, count: 25 },
  verified: true,
  active: true
})
```

## Next Steps

1. **Customize Branding:**
   - Update logo and colors in `/client/css/style.css`
   - Change app name in all HTML files

2. **Add Images:**
   - Add provider photos to `/client/images/`
   - Update image paths in the database

3. **Configure Email Notifications:**
   - Add an email service (SendGrid, Mailgun, etc.)
   - Send booking confirmations

4. **Add Geocoding:**
   - Integrate Google Maps API or Mapbox
   - Auto-fill coordinates from addresses

5. **Deploy to Production:**
   - See DEPLOYMENT.md for deployment guides

## Getting Help

- Check the README.md for general information
- Review the API documentation in the code comments
- MongoDB docs: https://docs.mongodb.com/
- Stripe docs: https://stripe.com/docs
- Express docs: https://expressjs.com/

## Development Tips

### Auto-reload Frontend Changes

Frontend files are served statically, so just refresh your browser to see changes.

### Debug Mode

Add this to your `.env`:
```env
NODE_ENV=development
```

This will show detailed error messages.

### View Database

**Using MongoDB Compass** (recommended):
1. Download: https://www.mongodb.com/try/download/compass
2. Connect to: `mongodb://localhost:27017`
3. Browse your `justb` database

**Using Command Line:**
```bash
mongosh
use justb
db.users.find()
db.providers.find()
db.bookings.find()
```

## Security Checklist (Before Production)

- [ ] Change JWT_SECRET to a strong random value
- [ ] Use production Stripe keys (sk_live_xxx)
- [ ] Enable HTTPS
- [ ] Set NODE_ENV=production
- [ ] Restrict CORS origins
- [ ] Add rate limiting
- [ ] Add input validation
- [ ] Set up proper logging
- [ ] Configure database backups
- [ ] Review and update security dependencies

Good luck building your breakfast marketplace!
