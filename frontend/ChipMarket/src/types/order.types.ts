// src/types/order.types.ts

export interface OrderDetail {
  id_detail_order: number;
  order_id: number;
  product_sku: string;
  quantity: number;
  price: string;
}

export interface Payment {
  id_payment: number;
  order_id: number;
  payment_method: string;
  amount: string;
  status: string;
  payment_date: string;
}

export interface Shipping {
  id_shipping: number;
  order_id: number;
  address: string;
  city: string;
  shipping_date: string;
  status: string;
  transport_company: string;
}

export interface Order {
  id_order: number;
  user_id: number;
  total_amount: string;
  status: string;
  order_date: string;
}

export interface OrderWithDetails extends Order {
  payments?: Payment[];
  details?: OrderDetail[];
  shipping?: Shipping;
}

export interface OrderApiResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: number;
      name: string;
      email: string;
    };
    totalOrders: number;
    orders: Order[];
  };
}

export interface OrderDetailsApiResponse {
  success: boolean;
  message: string;
  data: OrderWithDetails;
}