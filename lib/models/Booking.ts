import mongoose, { Document, Model, Schema } from 'mongoose';

interface BookingItem {
  menuItemId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
}

interface DeliveryAddress {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  coordinates?: {
    lat?: number;
    lng?: number;
  };
  notes?: string;
}

export interface IBooking extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  providerId: mongoose.Types.ObjectId;
  items: BookingItem[];
  deliveryDate: Date;
  deliveryTime: string;
  deliveryType: 'delivery' | 'pickup';
  deliveryAddress?: DeliveryAddress;
  pricing: {
    subtotal: number;
    deliveryFee: number;
    tax: number;
    total: number;
  };
  payment: {
    method: 'card' | 'cash';
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    stripePaymentIntentId?: string;
    paidAt?: Date;
  };
  status: 'pending' | 'confirmed' | 'preparing' | 'on-the-way' | 'delivered' | 'completed' | 'cancelled';
  specialInstructions?: string;
  recurring?: {
    enabled: boolean;
    frequency: 'daily' | 'weekdays' | 'weekends';
    endDate?: Date;
  };
  review?: {
    rating?: number;
    comment?: string;
    createdAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    providerId: {
      type: Schema.Types.ObjectId,
      ref: 'Provider',
      required: true,
    },
    items: [
      {
        menuItemId: {
          type: Schema.Types.ObjectId,
          ref: 'MenuItem',
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
    deliveryDate: {
      type: Date,
      required: true,
    },
    deliveryTime: {
      type: String,
      required: true,
    },
    deliveryType: {
      type: String,
      enum: ['delivery', 'pickup'],
      required: true,
    },
    deliveryAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
      notes: String,
    },
    pricing: {
      subtotal: {
        type: Number,
        required: true,
      },
      deliveryFee: {
        type: Number,
        default: 0,
      },
      tax: {
        type: Number,
        default: 0,
      },
      total: {
        type: Number,
        required: true,
      },
    },
    payment: {
      method: {
        type: String,
        enum: ['card', 'cash'],
        default: 'card',
      },
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending',
      },
      stripePaymentIntentId: String,
      paidAt: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'on-the-way', 'delivered', 'completed', 'cancelled'],
      default: 'pending',
    },
    specialInstructions: String,
    recurring: {
      enabled: {
        type: Boolean,
        default: false,
      },
      frequency: {
        type: String,
        enum: ['daily', 'weekdays', 'weekends'],
        default: 'daily',
      },
      endDate: Date,
    },
    review: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: String,
      createdAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ providerId: 1, deliveryDate: 1 });
bookingSchema.index({ status: 1 });

const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>('Booking', bookingSchema);

export default Booking;
