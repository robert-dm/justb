/**
 * Auto-seed Lisbon demo data
 * This runs automatically when the database is empty to ensure /providers is never empty
 */

import bcrypt from 'bcryptjs';
import User from './models/User';
import Provider from './models/Provider';
import MenuItem from './models/MenuItem';

// Lisbon coordinates for neighborhoods
const NEIGHBORHOODS = {
  alfama: { lat: 38.7131, lng: -9.1289 },
  bairroAlto: { lat: 38.7143, lng: -9.1459 },
  chiado: { lat: 38.7107, lng: -9.1423 },
  baixa: { lat: 38.7079, lng: -9.1371 },
  graca: { lat: 38.7184, lng: -9.1311 },
  principeReal: { lat: 38.7169, lng: -9.1508 },
  mouraria: { lat: 38.7165, lng: -9.1346 },
  arroios: { lat: 38.7258, lng: -9.1363 },
};

// Demo providers with authentic Lisbon character
const DEMO_PROVIDERS = [
  {
    email: 'pastelaria.belem@demo.justb.app',
    businessName: 'Pastelaria Belém Nova',
    neighborhood: 'alfama',
    description: 'Traditional pastelaria serving fresh pastéis de nata and classic Portuguese breakfast since 1987. Family recipes passed down three generations.',
    cuisine: ['traditional', 'portuguese'],
    street: 'Rua de São João da Praça, 103',
    city: 'Lisboa',
    zipCode: '1100-521',
    deliveryRadius: 3,
    minimumOrder: 8,
    deliveryFee: 2.5,
  },
  {
    email: 'padaria.graca@demo.justb.app',
    businessName: 'Padaria da Graça',
    neighborhood: 'graca',
    description: 'Neighborhood bakery in Graça offering fresh pão, bolo de arroz, and traditional Portuguese breakfast. Morning deliveries to nearby apartments.',
    cuisine: ['traditional', 'bakery'],
    street: 'Largo da Graça, 58',
    city: 'Lisboa',
    zipCode: '1170-165',
    deliveryRadius: 2.5,
    minimumOrder: 6,
    deliveryFee: 2,
  },
  {
    email: 'cafe.chiado@demo.justb.app',
    businessName: 'Café do Chiado',
    neighborhood: 'chiado',
    description: 'Historic café serving galão, torradas, and continental breakfast since 1925. A Chiado institution.',
    cuisine: ['continental', 'traditional'],
    street: 'Rua Garrett, 120',
    city: 'Lisboa',
    zipCode: '1200-273',
    deliveryRadius: 2,
    minimumOrder: 7,
    deliveryFee: 2.5,
  },
  {
    email: 'bairro.breakfast@demo.justb.app',
    businessName: 'Bairro Alto Breakfast Club',
    neighborhood: 'bairroAlto',
    description: 'Modern breakfast spot blending Portuguese classics with international options. Acai bowls meet pastel de nata.',
    cuisine: ['continental', 'healthy'],
    street: 'Rua da Rosa, 245',
    city: 'Lisboa',
    zipCode: '1200-385',
    deliveryRadius: 3,
    minimumOrder: 10,
    deliveryFee: 3,
  },
  {
    email: 'mouraria.cozinha@demo.justb.app',
    businessName: 'Cozinha da Mouraria',
    neighborhood: 'mouraria',
    description: 'Small kitchen serving homemade Portuguese breakfast. Specialties: ovos mexidos, chouriço, queijo da serra.',
    cuisine: ['traditional', 'homemade'],
    street: 'Rua do Capelão, 12',
    city: 'Lisboa',
    zipCode: '1100-122',
    deliveryRadius: 2,
    minimumOrder: 9,
    deliveryFee: 2,
  },
  {
    email: 'baixa.pastelaria@demo.justb.app',
    businessName: 'Pastelaria Baixa',
    neighborhood: 'baixa',
    description: 'Busy pastelaria in the heart of downtown Lisbon. Quick service, traditional pastries, strong coffee.',
    cuisine: ['traditional', 'quick'],
    street: 'Rua Augusta, 272',
    city: 'Lisboa',
    zipCode: '1100-053',
    deliveryRadius: 2.5,
    minimumOrder: 6,
    deliveryFee: 2,
  },
  {
    email: 'principe.brunch@demo.justb.app',
    businessName: 'Príncipe Real Brunch',
    neighborhood: 'principeReal',
    description: 'Upscale breakfast and brunch in Príncipe Real. Organic ingredients, artisan bread, specialty coffee.',
    cuisine: ['continental', 'organic'],
    street: 'Rua da Escola Politécnica, 27',
    city: 'Lisboa',
    zipCode: '1250-101',
    deliveryRadius: 3,
    minimumOrder: 12,
    deliveryFee: 3.5,
  },
  {
    email: 'arroios.padaria@demo.justb.app',
    businessName: 'Padaria Arroios',
    neighborhood: 'arroios',
    description: 'Local padaria serving the Arroios neighborhood. Fresh bread daily, traditional cakes, simple breakfast.',
    cuisine: ['traditional', 'bakery'],
    street: 'Rua Ângela Pinto, 15',
    city: 'Lisboa',
    zipCode: '1900-026',
    deliveryRadius: 2,
    minimumOrder: 5,
    deliveryFee: 1.5,
  },
];

// Portuguese menu items for each provider type
const MENU_TEMPLATES = {
  traditional: [
    { name: 'Pastel de Nata', price: 1.5, description: 'Traditional Portuguese custard tart', category: 'sweet', preparationTime: 5, allergens: ['eggs', 'dairy', 'gluten'] },
    { name: 'Pão com Manteiga', price: 2, description: 'Fresh bread with butter', category: 'savory', preparationTime: 5, allergens: ['gluten', 'dairy'] },
    { name: 'Galão', price: 2.5, description: 'Portuguese latte (espresso with hot milk)', category: 'traditional', preparationTime: 5, allergens: ['dairy'] },
    { name: 'Torrada', price: 2.5, description: 'Toasted bread with butter and jam', category: 'traditional', preparationTime: 8, allergens: ['gluten', 'dairy'] },
    { name: 'Bolo de Arroz', price: 1.8, description: 'Traditional rice cake', category: 'sweet', preparationTime: 5, allergens: ['eggs', 'gluten'] },
    { name: 'Queijo da Serra', price: 4, description: 'Portuguese mountain cheese with bread', category: 'savory', preparationTime: 5, allergens: ['dairy', 'gluten'] },
  ],
  continental: [
    { name: 'Croissant', price: 2.2, description: 'Butter croissant', category: 'continental', preparationTime: 5, allergens: ['gluten', 'dairy'] },
    { name: 'Continental Breakfast', price: 8.5, description: 'Coffee, croissant, juice, and fruit', category: 'continental', preparationTime: 10, allergens: ['gluten', 'dairy'] },
    { name: 'Cappuccino', price: 2.8, description: 'Italian-style espresso with steamed milk', category: 'continental', preparationTime: 5, allergens: ['dairy'] },
    { name: 'Fresh Orange Juice', price: 3.5, description: 'Freshly squeezed Algarve oranges', category: 'continental', preparationTime: 5, allergens: [] },
  ],
  hearty: [
    { name: 'Ovos Mexidos com Chouriço', price: 6.5, description: 'Scrambled eggs with Portuguese chorizo', category: 'savory', preparationTime: 12, allergens: ['eggs'] },
    { name: 'Tosta Mista', price: 4.5, description: 'Grilled ham and cheese sandwich', category: 'savory', preparationTime: 8, allergens: ['gluten', 'dairy'] },
    { name: 'Sandes de Presunto', price: 5, description: 'Portuguese ham sandwich with cheese', category: 'savory', preparationTime: 8, allergens: ['gluten', 'dairy'] },
  ],
  healthy: [
    { name: 'Açaí Bowl', price: 7.5, description: 'Açaí with granola, banana, and honey', category: 'sweet', preparationTime: 10, allergens: ['nuts'] },
    { name: 'Yogurt & Granola', price: 5.5, description: 'Greek yogurt with homemade granola and berries', category: 'sweet', preparationTime: 8, allergens: ['dairy', 'nuts'] },
    { name: 'Fresh Fruit Salad', price: 4.5, description: 'Seasonal Portuguese fruits', category: 'sweet', preparationTime: 10, allergens: [] },
  ],
};

async function seedMenuItems(providerId: any, cuisineTypes: string[]) {
  const items: any[] = [];
  
  // Always add traditional items
  const traditionalItems = MENU_TEMPLATES.traditional.slice(0, 4);
  items.push(...traditionalItems);
  
  // Add cuisine-specific items
  if (cuisineTypes.includes('continental')) {
    items.push(...MENU_TEMPLATES.continental.slice(0, 3));
  }
  
  if (cuisineTypes.includes('homemade') || cuisineTypes.includes('traditional')) {
    items.push(...MENU_TEMPLATES.hearty.slice(0, 2));
  }
  
  if (cuisineTypes.includes('healthy') || cuisineTypes.includes('organic')) {
    items.push(...MENU_TEMPLATES.healthy);
  }
  
  // Create menu items
  for (const item of items) {
    await MenuItem.create({
      providerId,
      ...item,
      available: true,
    });
  }
}

let seedingInProgress = false;

export async function ensureLisbonDemoData(): Promise<void> {
  // Prevent concurrent seeding
  if (seedingInProgress) {
    console.log('Demo seed already in progress, skipping...');
    return;
  }

  try {
    // Check if we have any providers
    const providerCount = await Provider.countDocuments();
    
    if (providerCount > 0) {
      // Data exists, no need to seed
      return;
    }

    console.log('No providers found, auto-seeding Lisbon demo data...');
    seedingInProgress = true;

    const hashedPassword = await bcrypt.hash('demo1234', 10);
    
    for (const providerData of DEMO_PROVIDERS) {
      // Create user for the provider
      const user = await User.create({
        name: providerData.businessName,
        email: providerData.email,
        password: hashedPassword,
        role: 'provider',
      });
      
      // Get coordinates for neighborhood
      const coords = NEIGHBORHOODS[providerData.neighborhood as keyof typeof NEIGHBORHOODS];
      
      // Create provider
      const provider = await Provider.create({
        userId: user._id,
        businessName: providerData.businessName,
        description: providerData.description,
        cuisine: providerData.cuisine,
        serviceType: {
          delivery: true,
          pickup: true,
        },
        deliveryRadius: providerData.deliveryRadius,
        minimumOrder: providerData.minimumOrder,
        deliveryFee: providerData.deliveryFee,
        address: {
          street: providerData.street,
          city: providerData.city,
          zipCode: providerData.zipCode,
          country: 'Portugal',
          coordinates: coords,
        },
        operatingHours: {
          monday: { open: '07:00', close: '11:00' },
          tuesday: { open: '07:00', close: '11:00' },
          wednesday: { open: '07:00', close: '11:00' },
          thursday: { open: '07:00', close: '11:00' },
          friday: { open: '07:00', close: '11:00' },
          saturday: { open: '07:30', close: '11:30' },
          sunday: { open: '08:00', close: '11:00' },
        },
        deliverySlots: [
          { time: '07:00', maxOrders: 10 },
          { time: '07:30', maxOrders: 10 },
          { time: '08:00', maxOrders: 15 },
          { time: '08:30', maxOrders: 15 },
          { time: '09:00', maxOrders: 12 },
          { time: '09:30', maxOrders: 10 },
        ],
        rating: {
          average: 0,
          count: 0,
        },
        verified: true,
        active: true,
      });
      
      // Create menu items for this provider
      await seedMenuItems(provider._id, providerData.cuisine);
    }
    
    const finalProviderCount = await Provider.countDocuments();
    const menuItemCount = await MenuItem.countDocuments();
    console.log(`✅ Auto-seeded ${finalProviderCount} providers with ${menuItemCount} menu items`);
  } catch (error) {
    console.error('❌ Auto-seed failed:', error);
  } finally {
    seedingInProgress = false;
  }
}
