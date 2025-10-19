// models/productoModels.ts
import { Schema, model, Document } from "mongoose";

interface Review {
  user: number;
  comentary: string;
  rating: number;
  createdAt?: Date;
}

interface Components {
  procesator?: string;
  mother_board?: string;
  ram?: string;
  storage?: string;
  gpu?: string;
  power_supply?: string;
  cooling_system?: string;
  case?: string;
  operative_system?: string;
}

export interface Producto extends Document {
  sku: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  images?: string[];
  components?: Components;
  garantee?: string;
  reviews?: Review[];
  createdAt?: Date;
  updatedAt?: Date;
}

const reviewSchema = new Schema<Review>({
  user: { type: Number, required: true },
  comentary: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now }
});

const componentsSchema = new Schema<Components>({
  procesator: String,
  mother_board: String,
  ram: String,
  storage: String,
  gpu: String,
  power_supply: String,
  cooling_system: String,
  case: String,
  operative_system: String
}, { _id: false });

const productSchema = new Schema<Producto>({
  sku: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true,
    min: 0 
  },
  category: { 
    type: String, 
    required: true 
  },
  stock: { 
    type: Number, 
    required: true,
    min: 0,
    default: 0 
  },
  images: [String],
  components: componentsSchema,
  garantee: String,
  reviews: [reviewSchema]
}, { 
  timestamps: true,
  collection: 'products' // Asegura que use la colección correcta
});

// Crear índice de texto para búsqueda
productSchema.index({ 
  name: 'text', 
  category: 'text',
  sku: 'text'
});

export default model<Producto>("Producto", productSchema);