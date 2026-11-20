export type UserRole = 'ADMIN' | 'KITCHEN_OPERATOR' | 'DELIVERY_DRIVER' | 'CUSTOMER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  isActive?: boolean;
  deletedAt?: string | null;
  createdAt?: string;
  vehiclePlate?: string;
}

export type PricingType = 'BY_WEIGHT_KG' | 'BY_WEIGHT_G' | 'BY_PIECE';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  pricingType: PricingType;
  category?: string;
  imageUrl?: string | null;
  isAvailable: boolean;
  deletedAt?: string | null;
}

export interface DashboardMetrics {
  totalSales: number;
  averageTicket: number;
  totalOrders: number;
  topItems: Array<{
    productId: string;
    productName?: string;
    _sum: {
      quantity: number | null;
    };
  }>;
}

export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  pricingType: PricingType;
  category?: string;
  imageUrl?: string;
}

export interface CreateEmployeeInput {
  name: string;
  email: string;
  password: string;
  role: 'KITCHEN_OPERATOR' | 'DELIVERY_DRIVER' | 'ADMIN';
  phone?: string;
  vehiclePlate?: string;
}

export type OrderStatus =
  | 'PENDING_KITCHEN'
  | 'IN_PREPARATION'
  | 'READY_FOR_PICKUP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type OrderType = 'COUNTER' | 'DINE_IN' | 'DELIVERY';

export interface OrderItem {
  id?: string;
  productId: string;
  quantity: number;
  unitPriceSnapshot?: number;
  unitPrice?: number;
  subtotal: number;
  notes?: string;
  product?: { name: string; imageUrl?: string };
}

export interface Order {
  id: string;
  orderNumber: string;
  orderType: OrderType;
  customerId?: string | null;
  customer?: { id: string; name: string; email: string; phone?: string };
  deliveryAddress?: string | null;
  deliveryLat?: number | null;
  deliveryLng?: number | null;
  deliveryFee?: number;
  notes?: string | null;
  subtotal: number;
  total: number;
  driverId?: string | null;
  driver?: { id: string; name: string; phone?: string; vehiclePlate?: string };
  status: OrderStatus;
  items?: OrderItem[];
  createdAt: string;
}
