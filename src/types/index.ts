export type Role = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';
export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
export type CustomerStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE';
export type MovementType = 'IN' | 'OUT';
export type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email: string;
  businessName: string;
  gstNumber?: string;
  customerType: CustomerType;
  address: string;
  status: CustomerStatus;
  followUpDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  followUpNotes?: FollowUpNote[];
}

export interface FollowUpNote {
  id: string;
  customerId: string;
  note: string;
  createdBy: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minStockAlert: number;
  warehouseLocation: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName?: string;
  productSku?: string;
  quantityChanged: number;
  movementType: MovementType;
  reason: string;
  createdBy: string;
  createdAt: string;
}

export interface ChallanItem {
  id: string;
  challanId: string;
  productId: string;
  productNameSnapshot: string;
  skuSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
}

export interface SalesChallan {
  id: string;
  challanNumber: string;
  customerId: string;
  customerName?: string;
  customerBusiness?: string;
  customerMobile?: string;
  customerEmail?: string;
  customerGst?: string;
  totalQuantity: number;
  totalAmount: number;
  deliveryAddress?: string;
  remarks?: string;
  status: ChallanStatus;
  createdBy: string;
  createdAt: string;
  items?: ChallanItem[];
}

export interface DashboardStats {
  totalCustomers: number;
  totalCustomersChange: string;
  lowStockAlerts: number;
  lowStockMessage: string;
  draftChallans: number;
  draftChallansMessage: string;
  todaySales: string;
  todaySalesValue: number;
  todaySalesChange: string;
  recentActivity: Array<{
    id: string;
    customer: string;
    type: string;
    status: string;
    amount: string;
    date: string;
  }>;
}
