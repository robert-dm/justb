import mongoose, { Document, Model, Schema } from 'mongoose';

interface OperatingDay {
  open?: string;
  close?: string;
  closed?: boolean;
}

interface DeliverySlot {
  time: string;
  maxOrders: number;
}

export interface IProvider extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  businessName: string;
  description: string;
  cuisine: string[];
  serviceType: {
    delivery: boolean;
    pickup: boolean;
  };
  deliveryRadius: number;
  minimumOrder: number;
  deliveryFee: number;
  address: {
    street: string;
    city: string;
    state?: string;
    zipCode: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  images: string[];
  operatingHours: {
    monday: OperatingDay;
    tuesday: OperatingDay;
    wednesday: OperatingDay;
    thursday: OperatingDay;
    friday: OperatingDay;
    saturday: OperatingDay;
    sunday: OperatingDay;
  };
  deliverySlots: DeliverySlot[];
  rating: {
    average: number;
    count: number;
  };
  verified: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const providerSchema = new Schema<IProvider>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    businessName: {
      type: String,
      required: [true, 'Please provide a business name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },
    cuisine: {
      type: [String],
      default: [],
    },
    serviceType: {
      delivery: {
        type: Boolean,
        default: true,
      },
      pickup: {
        type: Boolean,
        default: false,
      },
    },
    deliveryRadius: {
      type: Number,
      default: 5,
    },
    minimumOrder: {
      type: Number,
      default: 0,
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    address: {
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: String,
      zipCode: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      coordinates: {
        lat: {
          type: Number,
          required: true,
        },
        lng: {
          type: Number,
          required: true,
        },
      },
    },
    images: [
      {
        type: String,
      },
    ],
    operatingHours: {
      monday: { open: String, close: String, closed: Boolean },
      tuesday: { open: String, close: String, closed: Boolean },
      wednesday: { open: String, close: String, closed: Boolean },
      thursday: { open: String, close: String, closed: Boolean },
      friday: { open: String, close: String, closed: Boolean },
      saturday: { open: String, close: String, closed: Boolean },
      sunday: { open: String, close: String, closed: Boolean },
    },
    deliverySlots: [
      {
        time: String,
        maxOrders: {
          type: Number,
          default: 10,
        },
      },
    ],
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    verified: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for geospatial queries
providerSchema.index({ 'address.coordinates': '2dsphere' });

const Provider: Model<IProvider> =
  mongoose.models.Provider || mongoose.model<IProvider>('Provider', providerSchema);

export default Provider;
