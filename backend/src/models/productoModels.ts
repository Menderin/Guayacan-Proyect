import { Schema, model, Document } from "mongoose";

export interface Producto extends Document {
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  categoria?: string;
  imagenURL?: string;
}

const productSchema = new Schema<Producto>({
  nombre: { type: String, required: true },
  descripcion: { type: String },
  precio: { type: Number, required: true },
  stock: { type: Number, required: true },
  categoria: { type: String },
  imagenURL: { type: String },
}, { timestamps: true });

export default model<Producto>("Producto", productSchema);