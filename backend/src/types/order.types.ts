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