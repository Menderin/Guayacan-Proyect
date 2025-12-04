// frontend src/types/order.types.ts

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface OrderDetail {
  id_detail_order: number;
  order_id: number;
  product_sku: string;
  quantity: number;
  price: string | number;
}

export interface Payment {
  id_payment: number;
  order_id: number;
  payment_method: string;
  amount: string | number;
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
  transport_company?: string;
}

export interface Order {
  id_order: number;
  user_id: number;
  total_amount: string;
  status: string;
  order_date: string;
  user?: User;
  payments?: Payment[];
  details?: OrderDetail[];
  shipping?: Shipping;
}

export interface OrderWithDetails extends Order {
  user: User;
  payments: Payment[];
  details: OrderDetail[];
}

export interface OrderSearchFilters {
  startDate: string;
  endDate: string;
  userId: string | number;
  userEmail: string;
  productSku: string;
  status: string;
  page: number;
  limit: number;
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

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type OrderStatus = 'Pending' | 'Completed' | 'Cancelled' | 'Processing';

export interface OrderProductInput {
  sku: string;
  quantity: number;
  name?: string;
  price?: number;
  stock?: number;
}

export interface ShippingAddress {
  address: string;
  city: string;
  transportCompany?: string;
}

export interface CreateOrderDTO {
  userId: number;
  products: OrderProductInput[];
  paymentMethod: string;
  shippingAddress?: ShippingAddress;
  status?: OrderStatus;
}

export interface CreateOrderApiResponse {
  success: boolean;
  message: string;
  data?: {
    order: Order;
    details: OrderDetail[];
    payment: Payment;
    shipping?: Shipping;
  };
}

export interface OrderSummary {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  itemCount: number;
}

export interface OrderWithUser extends Order {
  user: User;
}

export interface OrderSearchApiResponse {
  success: boolean;
  message: string;
  data: OrderWithUser[];
  pagination: Pagination;
}

export type PaymentInfo = Payment;
export type OrderDetailInfo = OrderDetail;
export type ShippingInfo = Shipping;
export type UserInfo = User;