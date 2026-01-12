# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

justB is a marketplace platform connecting tourists in rental properties with local breakfast providers. It's a full-stack web application with a vanilla JavaScript frontend and an Express/MongoDB backend.

## Development Commands

### Setup and Installation
```bash
npm install                    # Install dependencies
cp .env.example .env          # Create environment file (edit with your credentials)
```

### Running the Application
```bash
npm run dev                   # Development mode with auto-reload (uses nodemon)
npm start                     # Production mode
```

### Database
- **Local MongoDB**: Ensure MongoDB is running (`brew services start mongodb-community` on Mac, `sudo systemctl start mongod` on Linux)
- **MongoDB Atlas**: Use connection string in `.env` MONGODB_URI

### Testing Payments
Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Any future expiry (e.g., 12/34), any 3-digit CVC

## Architecture

### Serverless-Ready Design
The application is designed to work in both traditional server and serverless (Vercel) environments:
- **Database connection caching**: `server/config/database.js` maintains a cached connection for serverless cold starts
- **Per-request DB connection**: Middleware in `server/index.js` ensures DB connection on each request
- **Conditional server start**: Server only starts when not in Vercel environment

### Authentication Flow
1. User registers via `/api/auth/register` → User document created with hashed password (bcrypt)
2. User logs in via `/api/auth/login` → JWT token generated and returned
3. JWT stored in browser localStorage
4. Protected routes use `protect` middleware (`server/middleware/auth.js`) → validates JWT from `Authorization: Bearer <token>` header
5. Role-based access controlled via `authorize` middleware

### User Roles
- **Tourist**: Can browse providers, place orders, view bookings
- **Provider**: Can create provider profile, manage menu, view and manage incoming orders
- **Admin**: Reserved for future admin functionality

### Data Models

**User** (`server/models/User.js`)
- Basic account info (name, email, password, role)
- Address with coordinates for location-based features
- Password hashing via bcrypt pre-save hook
- `comparePassword` method for authentication

**Provider** (`server/models/Provider.js`)
- Linked to User via `userId` reference
- Business details (name, description, cuisine types)
- Service configuration (delivery/pickup, radius, fees)
- Address with geospatial coordinates (indexed with 2dsphere)
- Operating hours and delivery time slots
- Rating system (average + count)
- Note: Menu items are now independent entities (see MenuItem model)

**MenuItem** (`server/models/MenuItem.js`)
- Independent entity linked to Provider via `providerId` reference
- Menu item details (name, description, price, image)
- Category (traditional, continental, vegan, gluten-free, sweet, savory)
- Availability status (boolean)
- Preparation time in minutes
- Allergen information array
- Nutritional information (calories, protein, carbs, fat)
- Indexed for efficient queries: by provider, by category, and text search on name/description
- Benefits of independent model:
  - Easy to query all menu items across providers
  - Better for search and discovery features
  - Simpler to manage and version menu items
  - Enables future features like menu history, popular items tracking

**Booking** (`server/models/Booking.js`)
- Links User and Provider via ObjectId references
- Order items with MenuItem references and snapshot data (preserves price/name at time of order)
- Items contain `menuItemId` reference to MenuItem document
- Delivery details (date, time, address, type)
- Pricing breakdown (subtotal, fees, tax, total)
- Payment tracking (Stripe integration, status)
- Order status workflow: pending → confirmed → preparing → on-the-way → delivered → completed
- Optional recurring orders (daily/weekdays/weekends)
- Review system (rating + comment)

### Geospatial Features
The Provider model uses MongoDB's geospatial indexing:
- `address.coordinates` field indexed with 2dsphere
- Enables location-based provider search by proximity
- Use MongoDB's `$near` or `$geoWithin` operators for queries

### API Structure

Routes are organized by resource in `server/routes/`:
- `auth.js` → Authentication (register, login)
- `providers.js` → Provider CRUD and search
- `menuItems.js` → Menu item CRUD and search
- `bookings.js` → Booking management
- `payments.js` → Stripe payment processing

Controllers in `server/controllers/` contain business logic for each route.

**Menu Item API Endpoints:**
- `GET /api/menu-items/all` → Search all menu items across providers (public)
- `GET /api/menu-items/provider/:providerId` → Get menu items for a specific provider (public)
- `GET /api/menu-items/:id` → Get single menu item (public)
- `POST /api/menu-items/provider/:providerId` → Create menu item (provider/admin only)
- `PUT /api/menu-items/:id` → Update menu item (provider/admin only)
- `DELETE /api/menu-items/:id` → Delete menu item (provider/admin only)
- `PATCH /api/menu-items/:id/toggle-availability` → Toggle availability (provider/admin only)

### Frontend Architecture

Static HTML pages in `client/` directory:
- Vanilla JavaScript (no framework)
- Fetch API for backend communication
- JWT token stored in localStorage
- Client-side routing handled by Express serving HTML files

Key frontend files:
- `client/js/app.js` → Common utilities, auth helpers, API client
- `client/js/booking.js` → Booking flow and cart management
- `client/css/` → Styling

### Payment Flow with Stripe

1. User adds items to cart and proceeds to checkout
2. Frontend requests payment intent from `/api/payments/create-intent`
3. Backend creates Stripe PaymentIntent with total amount
4. Frontend displays Stripe payment form
5. User enters card details → Stripe processes payment
6. Frontend confirms payment via `/api/payments/confirm`
7. Backend updates booking payment status
8. Booking moves to confirmed status

### Environment Variables

Required in `.env`:
- `MONGODB_URI` → MongoDB connection string
- `JWT_SECRET` → Secret key for JWT signing (use strong random value in production)
- `STRIPE_SECRET_KEY` → Stripe secret key (sk_test_* for dev, sk_live_* for prod)
- `STRIPE_PUBLISHABLE_KEY` → Stripe publishable key (pk_test_* for dev)
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` → Google Maps browser API key (required for address selection)
- `GOOGLE_MAPS_API_KEY` → Google Maps server API key (optional, for fallback geocoding)
- `CLIENT_URL` → Frontend URL for CORS (optional, defaults to localhost:3000)
- `PORT` → Server port (optional, defaults to 3000)

### Google Maps Integration

The application uses Google Maps for interactive address selection in provider and tourist profiles.

**Setup Instructions:**

1. **Create Google Cloud Project:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select an existing one
   - Navigate to "APIs & Services" → "Library"

2. **Enable Required APIs:**
   - Maps JavaScript API (for map display)
   - Places API (for address autocomplete)
   - Geocoding API (for coordinate conversion)

3. **Create API Keys:**

   **Browser Key** (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY):
   - Create an API key
   - Restrict to HTTP referrers (add your domains)
   - Allow access to: Maps JavaScript API, Places API
   - This key is exposed to the browser

   **Server Key** (GOOGLE_MAPS_API_KEY) - Optional:
   - Create a separate API key
   - Restrict to Geocoding API only
   - Used for server-side fallback geocoding
   - Never expose this key to the browser

4. **Set Up Billing:**
   - Google provides $200/month free credit
   - Billing account required even for free tier
   - Set up budget alerts to monitor usage

5. **Add Keys to Environment:**
   ```bash
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_browser_key_here
   GOOGLE_MAPS_API_KEY=your_server_key_here
   ```

**Usage in Forms:**

- **Provider Creation:** Map-based address selection is required. Users must select their business location on the map or via autocomplete.
- **Provider Profile Update:** Existing address shown on map. Users can update location by clicking map or searching.
- **Tourist Profile:** Optional address with map. Helps recommend nearby providers and estimate delivery times.

**Components:**

- `AddressSelector` (`/components/address/address-selector.tsx`) - High-level component combining map and form fields
- `AddressMapPicker` (`/components/address/address-map-picker.tsx`) - Interactive map with autocomplete and click-to-select
- `AddressFormFields` (`/components/address/address-form-fields.tsx`) - Standard address input fields
- `useGoogleMaps` (`/hooks/use-google-maps.ts`) - Hook to load Google Maps API

**Address Selection Methods:**

1. **Autocomplete Search:** Type address → select from suggestions → map updates with marker
2. **Map Click:** Click on map → reverse geocode → address fields populate
3. **Marker Drag:** Drag marker → reverse geocode → address fields update
4. **Manual Entry:** Type in form fields → coordinates can be added via map

**Data Storage:**

Addresses are stored with coordinates in MongoDB:
```javascript
address: {
  street: String,
  city: String,
  state: String,
  zipCode: String,
  country: String,
  coordinates: { lat: Number, lng: Number }
}
```

**Geospatial Queries:**

Provider documents have a 2dsphere index on `address.coordinates` enabling location-based searches:
```javascript
Provider.find({
  'address.coordinates': {
    $near: {
      $geometry: { type: 'Point', coordinates: [lng, lat] },
      $maxDistance: radiusInMeters
    }
  }
})
```

**Security Notes:**

- Browser API key (NEXT_PUBLIC_*) is exposed to users - restrict by HTTP referrer
- Server API key should never be exposed - use only in API routes
- Monitor API usage in Google Cloud Console
- Set up billing alerts to prevent unexpected charges

### Deployment

**Vercel Serverless** (configured via `vercel.json`):
- Entry point: `server/index.js` exported as module
- All routes proxy through single serverless function
- Database connection cached for cold start optimization
- CORS dynamically configured for Vercel environment

**Traditional Server** (Heroku, DigitalOcean, AWS):
- Server starts normally when not in Vercel environment
- Database connects once on startup
- See `DEPLOYMENT.md` for detailed platform-specific instructions

## Common Development Patterns

### Adding a New API Endpoint
1. Create controller function in appropriate `server/controllers/*Controller.js`
2. Add route in corresponding `server/routes/*.js` file
3. Use `protect` middleware for authenticated routes
4. Use `authorize('role1', 'role2')` middleware for role-specific routes

### Working with Menu Items
Menu items are independent entities linked to providers:
- Create via `POST /api/menu-items/provider/:providerId`
- Each item requires: name, price, providerId
- Optional fields: description, image, category, allergens, nutritionalInfo, preparationTime
- Categories: traditional, continental, vegan, gluten-free, sweet, savory
- Query all items for a provider: `GET /api/menu-items/provider/:providerId`
- Search across all providers: `GET /api/menu-items/all?search=croissant&category=continental`
- Toggle availability without full update: `PATCH /api/menu-items/:id/toggle-availability`

Example creating a menu item:
```javascript
const menuItem = await MenuItem.create({
  providerId: provider._id,
  name: 'Croissant & Coffee',
  description: 'Fresh butter croissant with artisan coffee',
  price: 8.50,
  category: 'continental',
  preparationTime: 10,
  allergens: ['gluten', 'dairy'],
  available: true
});
```

### Geospatial Queries
When querying providers by location:
```javascript
Provider.find({
  'address.coordinates': {
    $near: {
      $geometry: { type: 'Point', coordinates: [lng, lat] },
      $maxDistance: radiusInMeters
    }
  }
})
```

### Testing Locally
1. Start MongoDB locally
2. Set up `.env` with test Stripe keys and local MongoDB URI
3. Run `npm run dev`
4. Register test accounts (tourist and provider)
5. Set up provider profile with menu items
6. Test booking flow with Stripe test cards

## Code Organization Principles

- **Models define schema and validation** → Keep business rules in model definitions
- **Controllers handle business logic** → Keep routes thin, logic in controllers
- **Middleware for cross-cutting concerns** → Auth, validation, error handling
- **Frontend makes authenticated requests** → Include JWT token in Authorization header
- **Error responses follow standard format** → `{ success: false, message: 'Error description' }`

## Important Notes

- Password hashing happens automatically in User model pre-save hook
- JWT tokens expire based on `JWT_EXPIRES_IN` env variable (default 7d)
- Provider coordinates must be in [longitude, latitude] order for MongoDB geospatial queries
- Stripe webhook endpoint at `/api/payments/webhook` requires raw body (special middleware handling in place)
- Frontend assumes API is at same origin (no separate API_URL needed)
- File uploads configured via multer (for provider images)
- **Menu items are independent entities**: When querying providers, menu items must be fetched separately via `/api/menu-items/provider/:providerId`
- **Booking item snapshots**: Bookings store snapshot data (name, price) from menu items at time of order to preserve pricing history
- **MenuItem text search**: The model has a text index on name and description fields for search functionality
- **Authorization for menu items**: Ownership is verified through the Provider model - users can only modify menu items for providers they own
