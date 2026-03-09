# justB

A marketplace platform connecting tourists in rental properties with local breakfast providers. Built with Next.js, MongoDB, and Zustand.

## Getting Started

```bash
npm install                    # Install dependencies
cp .env.example .env          # Create environment file (edit with your credentials)
npm run dev                   # Start development server (http://localhost:3002)
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot-reload |
| `npm start` | Start production server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm test` | Run all tests once |
| `npm run test:watch` | Run tests in watch mode (re-runs on file changes) |

## Testing

Tests use [Vitest](https://vitest.dev/) with jsdom environment. Test files are in the `tests/` directory.

```bash
npm test                      # Run all tests once
npm run test:watch            # Run in watch mode (re-runs on file changes)
npx vitest run tests/cart-store.test.ts   # Run a specific test file
```

### What's tested

- **Cart store** (`tests/cart-store.test.ts`) — add/remove items, provider switching, pricing calculations, delivery fees, search address
- **Booking API** (`tests/booking-api.test.ts`) — booking creation, bulk/multi-day bookings, group filtering, payment simulation, status updates, cancellation, reviews, authorization

### Writing new tests

- Place test files in `tests/` with a `.test.ts` or `.test.tsx` extension
- Use `@/` path aliases (same as the app)
- Mock external dependencies (DB, auth) — see existing tests for patterns
- API route tests use `NextRequest` and mock Mongoose models

## Deploy on Vercel

The easiest way to deploy is using the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

See [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
