import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/guayacan_db';

export const connectMongoDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB conectado exitosamente');
    console.log(`📍 URI: ${MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//****:****@')}`);
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};



const componentSchema = new mongoose.Schema({
  procesator: String,
  mother_board: String,
  ram: String,
  storage: String,
  gpu: String,
  power_supply: String,
  cooling_system: String,
  case: String,
  operative_system: String
}, {
  _id: false
});

const reviewSchema = new mongoose.Schema({
  user: {
    type: Number,
    required: true
  },
  comentary: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  _id: true
});

const productSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: [true, 'El SKU es requerido'],
    unique: true,
    trim: true,
    minlength: 10,
    maxlength: 20
  },
  name: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    minlength: 3,
    maxlength: 100
  },
  price: {
    type: Number,
    required: [true, 'El precio es requerido'],
    min: [0, 'El precio no puede ser negativo']
  },
  category: {
    type: String,
    required: [true, 'La categoría es requerida'],
    trim: true
  },
  stock: {
    type: Number,
    required: [true, 'El stock es requerido'],
    min: [0, 'El stock no puede ser negativo'],
    default: 0
  },
  images: {
    type: [String],
    validate: {
      validator: function (v: string[]) {
        return Array.isArray(v) && v.length > 0;
      },
      message: 'Debe haber al menos una imagen'
    }
  },
  components: {
    type: componentSchema,
    required: true
  },
  garantee: {
    type: String,
    enum: ['1 año', '2 años', '3 años', 'Sin garantía'],
    default: '1 año'
  },
  reviews: {
    type: [reviewSchema],
    default: []
  }
}, {
  timestamps: true,
  collection: 'products'
});

// Índices
productSchema.index({ sku: 1 }, { unique: true });
productSchema.index({ name: 'text', category: 'text' });
productSchema.index({ price: 1 });
productSchema.index({ stock: 1 });
productSchema.index({ createdAt: -1 });

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'La cantidad debe ser al menos 1'],
    default: 1
  }
}, {
  _id: false
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
    unique: true
  },
  products: {
    type: [cartItemSchema],
    default: []
  }
}, {
  timestamps: true,
  collection: 'carts'
});

cartSchema.index({ userId: 1 }, { unique: true });

export const Product = mongoose.model('Product', productSchema);
export const Cart = mongoose.model('Cart', cartSchema);

/**
 * Función para poblar la base de datos con datos de ejemplo
 * NOTA: Esta función se puede llamar desde el backend si es necesario
 * pero los datos iniciales ya se cargan con init-mongo.js en Docker
 */
export const seedDatabase = async () => {
  try {
    console.log('🌱 Verificando productos existentes...');
    
    const existingProducts = await Product.countDocuments();
    
    if (existingProducts > 0) {
      console.log(`ℹ️  Ya existen ${existingProducts} productos en la base de datos`);
      console.log('💡 Usa Product.deleteMany({}) si deseas limpiar la base de datos primero');
      return;
    }

    console.log('📦 Insertando productos de ejemplo...');

    const products = [
      {
        sku: 'SKU1234567890',
        name: 'PC Gamer Ryzen 7',
        price: 1299000,
        category: 'Computadores',
        stock: 10,
        images: ['https://example.com/pc1.jpg'],
        components: {
          procesator: 'AMD Ryzen 7 5800X',
          mother_board: 'MSI B550 Tomahawk',
          ram: '16GB DDR4',
          storage: '1TB SSD',
          gpu: 'NVIDIA RTX 3070',
          power_supply: '650W 80+ Gold',
          cooling_system: 'Cooler Master Hyper 212',
          case: 'NZXT H510',
          operative_system: 'Windows 11'
        },
        garantee: '2 años',
        reviews: [
          {
            user: 1,
            comentary: 'Excelente rendimiento para gaming',
            rating: 5
          }
        ]
      },
      {
        sku: 'SKU0987654321',
        name: 'PC Oficina Intel i5',
        price: 499000,
        category: 'Computadores',
        stock: 25,
        images: ['https://example.com/pc2.jpg'],
        components: {
          procesator: 'Intel Core i5-11400',
          mother_board: 'ASUS Prime B560M-A',
          ram: '8GB DDR4',
          storage: '512GB SSD',
          gpu: 'Intel UHD Graphics',
          power_supply: '500W',
          cooling_system: 'Stock Intel',
          case: 'Thermaltake Versa H18',
          operative_system: 'Windows 10'
        },
        garantee: '1 año',
        reviews: []
      },
      {
        sku: 'SKU1122334455',
        name: 'PC Workstation Ryzen 9',
        price: 2499000,
        category: 'Computadores',
        stock: 5,
        images: ['https://example.com/pc3.jpg'],
        components: {
          procesator: 'AMD Ryzen 9 5950X',
          mother_board: 'ASUS ROG Crosshair VIII',
          ram: '32GB DDR4',
          storage: '2TB NVMe SSD',
          gpu: 'NVIDIA RTX 3090',
          power_supply: '850W 80+ Platinum',
          cooling_system: 'Corsair H150i',
          case: 'Lian Li O11 Dynamic',
          operative_system: 'Windows 11 Pro'
        },
        garantee: '3 años',
        reviews: [
          {
            user: 2,
            comentary: 'Perfecto para renderizado 3D',
            rating: 5
          },
          {
            user: 3,
            comentary: 'Excelente relación calidad-precio',
            rating: 4
          }
        ]
      }
    ];

    await Product.insertMany(products);
    console.log(`✅ ${products.length} productos insertados exitosamente`);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 11000) {
      console.log('⚠️  Algunos productos ya existen (SKU duplicado)');
    } else {
      console.error('❌ Error al poblar la base de datos:', error);
      throw error;
    }
  }
};