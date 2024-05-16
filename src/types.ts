export interface ProductInfo {
  id: number;
  name: string;
  description: string;
  price: number;
  on_sale: boolean;
  images: {
    thumbnail: string;
    large: string;
  };
  stock_status: string;
  stock_quantity: number;
}

export interface OrderItem {
  id?: number;
  order_id?: number;
  product_id: number;
  qty: number;
  item_price: number;
  item_total: number;
}

export interface OrderData {
  id?: number;
  user_id?: number;
  order_date?: number;
  customer_first_name: string;
  customer_last_name: string;
  customer_address: string;
  customer_postcode: string;
  customer_city: string;
  customer_email: string;
  customer_phone: string;
  order_total: number;
  created_at?: string;
  updated_at?: string;
  order_items: OrderItem[];
}

export interface OrderDataResponse {
  data: OrderData;
  status: string;
}
