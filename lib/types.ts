export interface Product {
  id: string;
  name_th: string;
  name_en: string;
  base_price: number;
  image_url: string;
  category: 'Coffee' | 'Tea' | 'Non-Coffee' | 'Bakery';
  is_available: boolean;
}

export type TempOption = 'ร้อน' | 'เย็น' | 'ปั่น';
export type SweetnessOption = '0%' | '25%' | '50%' | '100%';
export type MilkOption = 'นมจืด' | 'นมถั่วเหลือง' | 'นมโอ๊ต';

export interface Customization {
  temperature: TempOption;
  sweetness: SweetnessOption;
  milk: MilkOption;
  toppings: string[]; // e.g. ["ไข่มุก", "เจลลี่", "เพิ่มช็อตกาแฟ"]
}

export interface CartItem {
  id: string; // unique cart item id
  product: Product;
  customization: Customization;
  quantity: number;
  price_per_unit: number;
}

export interface Customer {
  id: string;
  phone: string;
  name: string;
  points: number;
  tier: 'General' | 'Silver' | 'Gold';
}

export type OrderStatus = 'รอตรวจสอบ' | 'กำลังชง' | 'พร้อมรับ' | 'สำเร็จ' | 'ยกเลิก';

export interface OrderItem {
  product_id: string;
  product_name: string;
  customizations: string[];
  quantity: number;
  price_per_unit: number;
}

export interface Order {
  id: string;
  order_number: string;
  phone: string;
  customer_name?: string;
  items: OrderItem[];
  subtotal: number;
  discount_amount: number;
  total: number;
  slip_url?: string;
  status: OrderStatus;
  created_at: string; // ISO string or time
}
