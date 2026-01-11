import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IMenuItem extends Document {
  _id: mongoose.Types.ObjectId;
  providerId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category: 'traditional' | 'continental' | 'vegan' | 'gluten-free' | 'sweet' | 'savory';
  available: boolean;
  preparationTime: number;
  allergens: ('dairy' | 'eggs' | 'nuts' | 'gluten' | 'soy' | 'shellfish' | 'fish')[];
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const menuItemSchema = new Schema<IMenuItem>(
  {
    providerId: {
      type: Schema.Types.ObjectId,
      ref: 'Provider',
      required: [true, 'Menu item must belong to a provider'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a menu item name'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: [0, 'Price cannot be negative'],
    },
    image: {
      type: String,
    },
    category: {
      type: String,
      enum: ['traditional', 'continental', 'vegan', 'gluten-free', 'sweet', 'savory'],
      default: 'traditional',
    },
    available: {
      type: Boolean,
      default: true,
    },
    preparationTime: {
      type: Number,
      default: 15,
    },
    allergens: [
      {
        type: String,
        enum: ['dairy', 'eggs', 'nuts', 'gluten', 'soy', 'shellfish', 'fish'],
      },
    ],
    nutritionalInfo: {
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
menuItemSchema.index({ providerId: 1, available: 1 });
menuItemSchema.index({ providerId: 1, category: 1 });
menuItemSchema.index({ name: 'text', description: 'text' });

const MenuItem: Model<IMenuItem> =
  mongoose.models.MenuItem || mongoose.model<IMenuItem>('MenuItem', menuItemSchema);

export default MenuItem;
