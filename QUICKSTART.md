# Quick Start Guide

Get justB running in 5 minutes!

## Prerequisites

- Node.js installed (v16+)
- MongoDB installed locally OR MongoDB Atlas account

## 1. Install Dependencies

```bash
npm install
```

## 2. Configure Database

### Option A: Local MongoDB (Easiest for Testing)

Make sure MongoDB is running:
```bash
# Mac (Homebrew):
brew services start mongodb-community

# Ubuntu/Linux:
sudo systemctl start mongod

# Windows:
# MongoDB runs as a service automatically
```

The default `.env` file is already configured for local MongoDB.

### Option B: MongoDB Atlas (Cloud)

1. Create free account: https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/justb
```

## 3. Get Stripe Keys (Required for Payments)

1. Sign up: https://stripe.com
2. Go to: https://dashboard.stripe.com/test/apikeys
3. Copy your keys
4. Update `.env`:
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## 4. Start the Server

```bash
npm run dev
```

You should see:
```
MongoDB Connected: localhost:27017
Server running on port 3000
```

## 5. Open Your Browser

Visit: http://localhost:3000

## Quick Test Flow

### Create Accounts

1. **Register as Tourist:**
   - Go to http://localhost:3000/register
   - Name: John Doe
   - Email: tourist@test.com
   - Password: password123
   - Role: Tourist

2. **Register as Provider:**
   - Open incognito/private window
   - Go to http://localhost:3000/register
   - Name: Jane's Breakfast
   - Email: provider@test.com
   - Password: password123
   - Role: Breakfast Provider

### Set Up Provider Profile

1. Login as provider (provider@test.com)
2. Go to Dashboard
3. Click "Profile" tab
4. Fill in:
   - Business Name: Morning Delights
   - Description: Delicious homemade breakfast
   - Address: 123 Main St, San Francisco, CA, 94102, USA
   - Latitude: 37.7749
   - Longitude: -122.4194
   - Check "Offer Delivery"
   - Delivery Radius: 10
   - Delivery Fee: 2.50
5. Click "Save Profile"

### Add Menu Items

1. Still logged in as provider
2. Click "Menu" tab
3. Click "Add Menu Item"
4. Add item:
   - Name: Croissant & Coffee
   - Description: Fresh butter croissant with artisan coffee
   - Price: 8.50
   - Category: Continental
5. Add more items as desired

### Place an Order

1. Logout, login as tourist (tourist@test.com)
2. Go to "Find Breakfast"
3. Click on "Morning Delights"
4. Add items to cart
5. Select delivery type: Delivery
6. Pick tomorrow's date
7. Pick time: 8:00 AM
8. Enter delivery address
9. Click "Proceed to Checkout"
10. Enter test card: 4242 4242 4242 4242
    - Expiry: Any future date (12/34)
    - CVC: Any 3 digits (123)
11. Click "Pay"

### Manage Orders (Provider)

1. Logout, login as provider
2. Go to Dashboard
3. See incoming order
4. Click "Accept Order"
5. Update status through the workflow

## Common Issues

### "MongoDB connection failed"

**Local MongoDB:**
```bash
# Check if MongoDB is running
# Mac:
brew services list | grep mongodb

# Linux:
sudo systemctl status mongod

# If not running, start it:
brew services start mongodb-community
# or
sudo systemctl start mongod
```

**MongoDB Atlas:**
- Check your connection string in `.env`
- Make sure IP address is whitelisted (allow 0.0.0.0/0 for testing)

### "Port 3000 already in use"

Kill the process:
```bash
# Mac/Linux:
lsof -ti:3000 | xargs kill -9

# Or change port in .env:
PORT=3001
```

### Payments not working

- Make sure you're using Stripe test keys (sk_test_xxx)
- Use test card number: 4242 4242 4242 4242
- Check Stripe Dashboard for errors

## Default Test Cards

Success:
```
Card: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
```

Decline:
```
Card: 4000 0000 0000 0002
Expiry: Any future date
CVC: Any 3 digits
```

Requires Authentication:
```
Card: 4000 0025 0000 3155
Expiry: Any future date
CVC: Any 3 digits
```

## File Structure

```
justb/
├── server/              # Backend
│   ├── models/         # Database schemas
│   ├── routes/         # API endpoints
│   ├── controllers/    # Business logic
│   ├── middleware/     # Auth, etc.
│   └── index.js        # Server entry
├── client/             # Frontend
│   ├── css/           # Styles
│   ├── js/            # JavaScript
│   └── *.html         # Pages
├── .env               # Configuration
├── package.json       # Dependencies
└── README.md          # Documentation
```

## Next Steps

1. Read SETUP.md for detailed configuration
2. Read DEPLOYMENT.md for production deployment
3. Customize the design in `client/css/style.css`
4. Add your own branding and images

## Getting Help

- Review error messages in the terminal
- Check browser console (F12)
- See SETUP.md for troubleshooting
- Check MongoDB logs
- Check Stripe Dashboard

## Development Mode

Auto-reload on changes:
```bash
npm run dev
```

The server will restart automatically when you edit backend files.
For frontend changes, just refresh your browser.

Happy coding! 🥐
