# justB

A marketplace platform connecting tourists in rental properties with local breakfast providers.

## Features

- User accounts for tourists and breakfast providers
- Location-based search for breakfast services
- Booking system with delivery scheduling
- Stripe payment integration
- Provider dashboards for menu management
- Reviews and ratings

## Tech Stack

- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Payments**: Stripe
- **Authentication**: JWT

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas account)
- Stripe account for payment processing

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update the `.env` file with your actual credentials:
   - Set your MongoDB connection string
   - Add your Stripe API keys
   - Generate a secure JWT secret

4. Start MongoDB (if running locally):
```bash
mongod
```

5. Start the development server:
```bash
npm run dev
```

6. Open your browser to `http://localhost:3000`

## Project Structure

```
justb/
├── client/              # Frontend files
│   ├── css/            # Stylesheets
│   ├── js/             # JavaScript files
│   ├── images/         # Images and assets
│   └── *.html          # HTML pages
├── server/             # Backend files
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── middleware/     # Express middleware
│   ├── config/         # Configuration files
│   └── index.js        # Server entry point
├── .env               # Environment variables (create from .env.example)
└── package.json       # Dependencies
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Providers
- `GET /api/providers` - Get all providers (with search/filter)
- `GET /api/providers/:id` - Get provider details
- `POST /api/providers` - Create provider profile (auth required)
- `PUT /api/providers/:id` - Update provider profile (auth required)

### Bookings
- `POST /api/bookings` - Create new booking (auth required)
- `GET /api/bookings/user` - Get user's bookings (auth required)
- `GET /api/bookings/provider` - Get provider's bookings (auth required)

### Payments
- `POST /api/payments/create-intent` - Create Stripe payment intent
- `POST /api/payments/confirm` - Confirm payment

## Development Notes

- The server serves both API endpoints and static HTML files
- Frontend uses vanilla JavaScript with fetch API for backend communication
- MongoDB stores users, providers, listings, and bookings
- JWT tokens are stored in localStorage for authentication
- Stripe handles all payment processing

## Next Steps

1. Set up your MongoDB database
2. Create a Stripe account and get API keys
3. Customize the branding and styling
4. Add your breakfast provider listings
5. Test the booking and payment flow
6. Deploy to production (Heroku, DigitalOcean, AWS, etc.)
