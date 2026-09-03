# Lisbon Demo Data

This project includes demo data for Lisbon breakfast providers to make the marketplace showable for investor/BD presentations.

## ⚠️ Important Note

All seeded data is **for demonstration purposes only**. The providers, menu items, and associated data are fictional examples created to showcase the platform's functionality.

## What Gets Seeded

- **8 Lisbon breakfast providers** across historic neighborhoods:
  - Alfama (Santa Maria Maior)
  - Bairro Alto (Misericórdia)
  - Chiado
  - Graça
  - Mouraria
  - Baixa
  - Príncipe Real
  - Arroios

- **~50 menu items** including:
  - Traditional Portuguese breakfast: pastel de nata, galão, pão, torradas
  - Continental options: croissants, cappuccino, fresh juice
  - Hearty items: ovos mexidos, tosta mista, sandes de presunto
  - Healthy options: açaí bowls, yogurt, fruit salad

## Auto-Seeding (Default Behavior)

**Demo data appears automatically** when the database is empty. No manual seeding required!

When you visit `/providers` for the first time on an empty database, the app automatically seeds the 8 Lisbon providers with menus. This ensures the marketplace is never empty when shown to investors or Airbnb BD.

## Manual Seeding (Local Development)

If running locally with MongoDB and you want to re-seed:

1. Ensure MongoDB is running
2. Set up `.env.local` with `MONGODB_URI`
3. Run the seed script:

```bash
npm run seed:lisbon
```

## Demo User Credentials

All demo provider accounts use:
- Email: `{provider-name}@demo.justb.app` (e.g., `pastelaria.belem@demo.justb.app`)
- Password: `demo1234`

These are **not** meant for production use.

## Clearing Demo Data

Re-running the seed script automatically clears existing demo data (users with `@demo.justb.app` emails) before inserting fresh data.

## Verification

After seeding, verify the data:

1. Visit https://justb-psi.vercel.app/providers
2. You should see "X items from 8 providers" instead of "0 items from 0 providers"
3. The demo notice banner should appear: "Lisbon demo: Listings shown are sample data for product demonstration"

## Files

- `/scripts/seed-lisbon.ts` - Command-line seed script
- `/app/api/seed/lisbon/route.ts` - API endpoint for seeding
- This file - Documentation

## Production Notes

Before going to production with real providers:

1. Remove or restrict access to the seed API endpoint
2. Clear all demo data
3. Update the demo notice logic in `/app/(public)/providers/providers-content.tsx`
