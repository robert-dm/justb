export type MenuCategory =
  | 'traditional'
  | 'continental'
  | 'vegan'
  | 'gluten-free'
  | 'sweet'
  | 'savory';

export type Allergen =
  | 'dairy'
  | 'eggs'
  | 'nuts'
  | 'gluten'
  | 'soy'
  | 'shellfish'
  | 'fish';

export interface NutritionalInfo {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface MenuItem {
  _id: string;
  providerId: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category: MenuCategory;
  available: boolean;
  preparationTime: number;
  allergens: Allergen[];
  nutritionalInfo?: NutritionalInfo;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItemFilters {
  search?: string;
  category?: MenuCategory;
  minPrice?: number;
  maxPrice?: number;
  available?: boolean;
}

export interface CreateMenuItemData {
  name: string;
  price: number;
  description?: string;
  image?: string;
  category?: MenuCategory;
  available?: boolean;
  preparationTime?: number;
  allergens?: Allergen[];
  nutritionalInfo?: NutritionalInfo;
}

export interface UpdateMenuItemData extends Partial<CreateMenuItemData> {}
