export interface OrderWithDetails {
  id_order: number;
  user_id: number;
  order_date: Date;
  status: string;
  total_amount: number;
  payments?: PaymentInfo[];
  details?: OrderDetailInfo[];
  shipping?: ShippingInfo;
}

export interface PaymentInfo {
  id_payment: number;
  payment_method: string;
  amount: number;
  status: string;
  payment_date: Date;
}

export interface OrderDetailInfo {
  id_detail_order: number;
  product_sku: string;
  quantity: number;
  price: number;
}

export interface ShippingInfo {
  id_shipping: number;
  address: string;
  city: string;
  status: string;
  transport_company: string;
  shipping_date: Date;
}

export interface CreateOrderRequest {
  userId: number;
  products: Array<{
    sku: string;
    quantity: number;
  }>;
  paymentMethod: string;
  shippingAddress?: {
    address: string;
    city: string;
    transportCompany?: string;
  };
  status?: string; 
}

export interface CreateOrderResponse {
  order: {
    id_order: number;
    user_id: number;
    order_date: Date;
    status: string;
    total_amount: number;
  };
  details: Array<{
    id_detail_order: number;
    product_sku: string;
    product_name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  payment: {
    id_payment: number;
    payment_method: string;
    amount: number;
    status: string;
  };
  shipping?: {
    id_shipping: number;
    address: string;
    city: string;
    status: string;
  };
}

export interface CreatePaymentRequest {
  orderId: number;
  paymentMethod: string;
  amount: number;
  status?: string; // Opcional, default "Pending"
  transactionId?: string; // Opcional: ID de transacción del gateway de pago
  notes?: string; // Opcional: Notas sobre el pago
}

export interface UpdatePaymentRequest {
  status?: string; // Actualizar estado: Pending, Completed, Failed, Refunded
  transactionId?: string;
  notes?: string;
}

export interface PaymentResponse {
  payment: {
    id_payment: number;
    order_id: number;
    payment_method: string;
    amount: number;
    status: string;
    payment_date: Date;
    transaction_id?: string;
    notes?: string;
  };
  order: {
    id_order: number;
    user_id: number;
    status: string;
    total_amount: number;
    paid_amount: number;
    remaining_amount: number;
  };
}

export const PAYMENT_STATUSES = {
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  REFUNDED: 'Refunded'
} as const;

export const PAYMENT_METHODS = {
  CREDIT_CARD: 'Tarjeta de crédito',
  DEBIT_CARD: 'Tarjeta de débito',
  BANK_TRANSFER: 'Transferencia bancaria',
  CASH: 'Efectivo',
  PAYPAL: 'PayPal',
  MERCADOPAGO: 'MercadoPago',
  WEBPAY: 'Webpay'
} as const;