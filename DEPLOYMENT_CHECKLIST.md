# Deployment Checklist for Airbnb BD Demo

## ✅ Changes Merged

[Pull Request #8](https://github.com/robert-dm/justb/pull/8) contains all investor-ready changes:

- ✅ Honest `/investors` page (no fake metrics)
- ✅ Lisbon-focused landing page
- ✅ Demo seed data scripts ready
- ✅ Visual polish complete

## 🚀 Post-Merge Steps

### 1. Seed the Database

After PR is merged and Vercel deploys the changes:

**Option A: Using curl**
```bash
curl -X POST https://justb-psi.vercel.app/api/seed/lisbon
```

**Option B: Using browser + Postman**
1. Open Postman or similar tool
2. Create a new POST request to `https://justb-psi.vercel.app/api/seed/lisbon`
3. Send the request
4. Verify response shows 8 providers created

### 2. Verify the Site

Check these URLs:

1. **Landing page**: https://justb-psi.vercel.app
   - ✅ Should say "Lisbon Breakfast to Your Rental"
   - ✅ Mentions Alfama, Bairro Alto, Chiado
   - ✅ No emoji feature grid

2. **Providers page**: https://justb-psi.vercel.app/providers
   - ✅ Shows "X items from 8 providers" (not "0 items from 0 providers")
   - ✅ Blue banner: "Lisbon demo: Listings shown are sample data"
   - ✅ Clicking a provider shows menu items

3. **Investors page**: https://justb-psi.vercel.app/investors
   - ✅ No fake metrics ($2.5M, 15k users, etc.)
   - ✅ Honest status: "Real providers: 0, Real orders: 0"
   - ✅ Clean one-pager format

### 3. Test Happy Path

1. Go to `/providers`
2. Click on "Pastelaria Belém Nova" or another provider
3. See menu items (pastel de nata, galão, etc.)
4. Add items to cart
5. Proceed to checkout (may require login)

### 4. Share with Airbnb BD

Site is now ready to screenshare or send via:
- Direct URL: https://justb-psi.vercel.app
- Specific page for BD: https://justb-psi.vercel.app/investors

## 📝 Talking Points for BD

When showing to Airbnb:

1. **This is a prototype** with demo data (stated clearly on /investors)
2. **Lisbon wedge**: 11.6M guest nights (Eurostat 2025), ~20k STRs in compact parishes
3. **Services gap**: Airbnb has Instacart (US groceries) + CookUnity (US meals), but no **local breakfast** at the listing
4. **Unit of execution**: parish-level density (Alfama first, then scale)
5. **Morning ritual**: daily take-rate vs. one-time airport transfer
6. **Product is live**: working checkout, multi-day orders, location-based search

## 🔍 What Changed

| Before | After |
|--------|-------|
| `/investors` had fake $2.5M seed round, 15k users | Honest one-pager: 0 real providers, demo data |
| Landing: "Find Local Providers" (generic) | "Lisbon Breakfast to Your Rental" (specific) |
| `/providers` showed "0 items from 0 providers" | Shows 8 Lisbon providers with ~50 items |
| Emoji feature grid (🌍🍳💳) | Clean 3-column cards |
| No demo data available | Seed script + API route ready |

## ⚠️ Important Notes

- All data marked as **DEMO** (investors page + providers banner)
- Demo providers: `{name}@demo.justb.app` / password `demo1234` (not for production)
- No fake traction claims anywhere
- Lisbon only (no cloned cities)

## 🐛 Troubleshooting

**If `/providers` still shows "0 items":**
1. Verify PR is merged and deployed on Vercel
2. Re-run seed: `POST /api/seed/lisbon`
3. Check Vercel function logs for errors
4. Verify `MONGODB_URI` is set in Vercel environment variables

**If images are missing:**
- This is expected (using placeholder images or none)
- Real providers would upload their own images

## Next Steps After Airbnb Meeting

If positive signal:
1. Pilot with 3-5 real Lisbon providers (Alfama + Graça)
2. 10-20 real orders to validate delivery
3. Measure: order density, delivery time, repeat rate
4. Build case for integration into Airbnb Services

If no interest:
1. Continue independent launch in Lisbon
2. Revisit Airbnb after proving unit economics

---

**Contact**: Robert  
**Repo**: https://github.com/robert-dm/justb  
**Live**: https://justb-psi.vercel.app
