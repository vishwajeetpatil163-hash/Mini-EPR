import bcrypt from 'bcryptjs';

export type Role = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';
export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
export type CustomerStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE';
export type MovementType = 'IN' | 'OUT';
export type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: string;
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
  totalQuantity: number;
  totalAmount: number;
  deliveryAddress?: string;
  remarks?: string;
  status: ChallanStatus;
  createdBy: string;
  createdAt: string;
  items?: ChallanItem[];
  customerNameSnapshot?: string;
}

class MemoryDatabase {
  private users: User[] = [];
  private customers: Customer[] = [];
  private followUpNotes: FollowUpNote[] = [];
  private products: Product[] = [];
  private stockMovements: StockMovement[] = [];
  private challans: SalesChallan[] = [];
  private challanItems: ChallanItem[] = [];
  private sequenceYear = new Date().getFullYear();
  private sequenceCounter = 1;

  constructor() {
    this.seed();
  }

  private seed() {
    const passwordHash = bcrypt.hashSync('admin123', 8);
    const now = new Date().toISOString();

    // 1. Seed Staff Users
    this.users = [
      {
        id: 'user-admin-1',
        name: 'Rajesh Sharma',
        email: 'admin@wholesale.com',
        passwordHash,
        role: 'ADMIN',
        createdAt: now,
      },
      {
        id: 'user-sales-1',
        name: 'Priya Patel',
        email: 'sales@wholesale.com',
        passwordHash: bcrypt.hashSync('sales123', 8),
        role: 'SALES',
        createdAt: now,
      },
      {
        id: 'user-wh-1',
        name: 'Suresh Kumar',
        email: 'warehouse@wholesale.com',
        passwordHash: bcrypt.hashSync('warehouse123', 8),
        role: 'WAREHOUSE',
        createdAt: now,
      },
      {
        id: 'user-acc-1',
        name: 'Anjali Gupta',
        email: 'accounts@wholesale.com',
        passwordHash: bcrypt.hashSync('accounts123', 8),
        role: 'ACCOUNTS',
        createdAt: now,
      },
    ];

    // 2. Seed Customers (10 Realistic Indian Wholesale & Retail Customers)
    this.customers = [
      {
        id: 'cust-1',
        name: 'Rajesh Kumar',
        mobile: '+91 98250 12345',
        email: 'rajesh@rajeshtraders.co.in',
        businessName: 'Sharma Traders & Co.',
        gstNumber: '24ABCDE1234F1Z5', // Fake sample GST for testing
        customerType: 'WHOLESALE',
        address: '102 Ring Road Market, Ahmedabad, Gujarat 380002',
        status: 'ACTIVE',
        followUpDate: '2026-08-15',
        notes: 'Sample testing account. Key wholesale client for Basmati Rice and Edible Oils.',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'cust-2',
        name: 'Priya Sharma',
        mobile: '+91 98980 67890',
        email: 'priya@sharmaretail.in',
        businessName: 'Patel Wholesale Mart',
        gstNumber: '24AAACS9876E1Z2', // Fake sample GST for testing
        customerType: 'RETAIL',
        address: '45 Station Road, Surat, Gujarat 395003',
        status: 'ACTIVE',
        followUpDate: '2026-08-20',
        notes: 'Sample testing account. Monthly FMCG restock customer.',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'cust-3',
        name: 'Amit Patel',
        mobile: '+91 98111 22334',
        email: 'amit@omenterprises.co.in',
        businessName: 'Om Enterprises',
        gstNumber: '27AABCO5544K1Z9', // Fake sample GST for testing
        customerType: 'WHOLESALE',
        address: 'Plot 12, GIDC Industrial Estate, Vadodara, Gujarat 390010',
        status: 'ACTIVE',
        followUpDate: '2026-08-18',
        notes: 'Sample testing account. Bulk buyer for Hardware and Electrical items.',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'cust-4',
        name: 'Sneha Reddy',
        mobile: '+91 98490 33445',
        email: 'sneha@balajidist.in',
        businessName: 'Shree Balaji Distributors',
        gstNumber: '36AABCS3344J1Z1', // Fake sample GST for testing
        customerType: 'DISTRIBUTOR',
        address: '88 Commercial Complex, MG Road, Hyderabad, Telangana 500001',
        status: 'ACTIVE',
        followUpDate: '2026-08-12',
        notes: 'Sample testing account. Regional distributor across South India.',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'cust-5',
        name: 'Vikram Singh',
        mobile: '+91 98100 55667',
        email: 'vikram@singhwholesale.com',
        businessName: 'Singh Wholesale Mart',
        gstNumber: '07AACCS7788P1Z8', // Fake sample GST for testing
        customerType: 'WHOLESALE',
        address: '14 Sadar Bazaar, Chandni Chowk, Delhi 110006',
        status: 'ACTIVE',
        followUpDate: '2026-08-22',
        notes: 'Sample testing account. Credit limit: ₹5,00,000. Key north zone distributor.',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'cust-6',
        name: 'Anjali Iyer',
        mobile: '+91 98400 11223',
        email: 'anjali@iyeragencies.in',
        businessName: 'Iyer & Sons Logistics',
        gstNumber: '33AACCI1122D1Z3', // Fake sample GST for testing
        customerType: 'DISTRIBUTOR',
        address: '204 Mount Road, Chennai, Tamil Nadu 600002',
        status: 'ACTIVE',
        followUpDate: '2026-08-25',
        notes: 'Sample testing account. Logistics and distribution hub.',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'cust-7',
        name: 'Suresh Gupta',
        mobile: '+91 98300 44556',
        email: 'suresh@guptacorp.co.in',
        businessName: 'Gupta Commercial Corp',
        gstNumber: '19AABCG9900M1Z4', // Fake sample GST for testing
        customerType: 'WHOLESALE',
        address: '56 Bada Bazaar, Kolkata, West Bengal 700007',
        status: 'INACTIVE',
        followUpDate: '2026-09-01',
        notes: 'Sample testing account. Account under audit review for payment cycle.',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'cust-8',
        name: 'Meena Nair',
        mobile: '+91 98470 66778',
        email: 'meena@mahalaxmitrading.in',
        businessName: 'Mahalaxmi Agency',
        gstNumber: '32AABCM4455R1Z6', // Fake sample GST for testing
        customerType: 'RETAIL',
        address: '12 MG Road, Kochi, Kerala 682016',
        status: 'LEAD',
        followUpDate: '2026-08-16',
        notes: 'Sample testing account. New retail lead inquiring about spices and beverages.',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'cust-9',
        name: 'Rahul Verma',
        mobile: '+91 98220 88990',
        email: 'rahul@vermasuppliers.in',
        businessName: 'Verma General Suppliers',
        gstNumber: '27AABCV2233H1Z7', // Fake sample GST for testing
        customerType: 'DISTRIBUTOR',
        address: '78 Market Yard, Pune, Maharashtra 411037',
        status: 'ACTIVE',
        followUpDate: '2026-08-19',
        notes: 'Sample testing account. High volume distributor for Western Maharashtra.',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'cust-10',
        name: 'Kavita Deshmukh',
        mobile: '+91 98800 99001',
        email: 'kavita@deshmukhent.co.in',
        businessName: 'Deshmukh Traders',
        gstNumber: '29AABCD1122K1Z0', // Fake sample GST for testing
        customerType: 'WHOLESALE',
        address: '301 Electronic City Phase 1, Bengaluru, Karnataka 560100',
        status: 'ACTIVE',
        followUpDate: '2026-08-28',
        notes: 'Sample testing account. Wholesale partner for electrical & hardware supplies.',
        createdAt: now,
        updatedAt: now,
      },
    ];

    // Seed FollowUp Notes
    this.followUpNotes = [
      {
        id: 'note-1',
        customerId: 'cust-1',
        note: 'Discussed upcoming Diwali festival stock order. Requested 5% bulk rebate on Basmati Rice.',
        createdBy: 'Priya Patel',
        createdAt: '2026-08-08T14:30:00Z',
      },
      {
        id: 'note-2',
        customerId: 'cust-1',
        note: 'Payment reminder sent for Sales Challan #CH-2026-0001.',
        createdBy: 'Anjali Gupta',
        createdAt: '2026-08-05T09:00:00Z',
      },
      {
        id: 'note-3',
        customerId: 'cust-5',
        note: 'Onboarding completed. GSTIN and tax documents verified successfully.',
        createdBy: 'Rajesh Sharma',
        createdAt: '2026-08-01T11:15:00Z',
      },
    ];

    // 3. Seed Products (15 Realistic Indian Wholesale FMCG / Hardware / Grocery Items)
    this.products = [
      {
        id: 'prod-1',
        name: 'Basmati Rice Premium 25kg Bag',
        sku: 'SKU-RICE-001',
        category: 'FMCG & Groceries',
        unitPrice: 1850.0,
        currentStock: 450,
        minStockAlert: 50,
        warehouseLocation: 'Warehouse A - Ahmedabad',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'prod-2',
        name: 'Tata Steel Pipe 2 inch (6m)',
        sku: 'SKU-STEEL-002',
        category: 'Hardware & Steel',
        unitPrice: 650.0,
        currentStock: 18,
        minStockAlert: 25,
        warehouseLocation: 'Warehouse B - Vadodara',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'prod-3',
        name: 'Surf Excel Detergent 1kg Pack',
        sku: 'SKU-SURF-003',
        category: 'Cleaning & Care',
        unitPrice: 215.0,
        currentStock: 1200,
        minStockAlert: 150,
        warehouseLocation: 'Warehouse A - Ahmedabad',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'prod-4',
        name: 'Havells LED Bulb 9W Cool Day',
        sku: 'SKU-LED-004',
        category: 'Electricals',
        unitPrice: 95.0,
        currentStock: 850,
        minStockAlert: 100,
        warehouseLocation: 'Warehouse C - Mumbai',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'prod-5',
        name: 'Amul Pure Ghee 1L Tin',
        sku: 'SKU-AMUL-005',
        category: 'Dairy & Groceries',
        unitPrice: 620.0,
        currentStock: 620,
        minStockAlert: 80,
        warehouseLocation: 'Warehouse A - Ahmedabad',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'prod-6',
        name: 'Fortune Sunflower Oil 5L Jar',
        sku: 'SKU-OIL-006',
        category: 'Edible Oils',
        unitPrice: 780.0,
        currentStock: 340,
        minStockAlert: 50,
        warehouseLocation: 'Warehouse B - Vadodara',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'prod-7',
        name: 'Tata Salt Iodized 1kg Pack',
        sku: 'SKU-SALT-007',
        category: 'FMCG & Groceries',
        unitPrice: 28.0,
        currentStock: 5000,
        minStockAlert: 500,
        warehouseLocation: 'Warehouse A - Ahmedabad',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'prod-8',
        name: 'Everest Garam Masala 100g',
        sku: 'SKU-SPICE-008',
        category: 'Spices & Condiments',
        unitPrice: 85.0,
        currentStock: 1500,
        minStockAlert: 200,
        warehouseLocation: 'Warehouse A - Ahmedabad',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'prod-9',
        name: 'Finolex Flexible Copper Cable 90m',
        sku: 'SKU-WIRE-009',
        category: 'Electricals',
        unitPrice: 1450.0,
        currentStock: 8,
        minStockAlert: 15,
        warehouseLocation: 'Warehouse C - Mumbai',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'prod-10',
        name: 'Asian Paints Tractor Emulsion 10L',
        sku: 'SKU-PAINT-010',
        category: 'Paints & Hardware',
        unitPrice: 2200.0,
        currentStock: 120,
        minStockAlert: 20,
        warehouseLocation: 'Warehouse C - Mumbai',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'prod-11',
        name: 'Parle-G Biscuit Box (24 Packs)',
        sku: 'SKU-BISCUIT-011',
        category: 'FMCG & Snacks',
        unitPrice: 120.0,
        currentStock: 950,
        minStockAlert: 100,
        warehouseLocation: 'Warehouse D - Bengaluru',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'prod-12',
        name: 'Brooke Bond Red Label Tea 500g',
        sku: 'SKU-TEA-012',
        category: 'Beverages',
        unitPrice: 290.0,
        currentStock: 410,
        minStockAlert: 60,
        warehouseLocation: 'Warehouse D - Bengaluru',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'prod-13',
        name: 'Godrej Mortise Door Lock Set',
        sku: 'SKU-LOCK-013',
        category: 'Hardware & Fittings',
        unitPrice: 1150.0,
        currentStock: 65,
        minStockAlert: 10,
        warehouseLocation: 'Warehouse B - Vadodara',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'prod-14',
        name: 'Havells Exhaust Fan 300mm',
        sku: 'SKU-FAN-014',
        category: 'Electricals',
        unitPrice: 1890.0,
        currentStock: 42,
        minStockAlert: 10,
        warehouseLocation: 'Warehouse C - Mumbai',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'prod-15',
        name: 'Dettol Antiseptic Liquid 1L',
        sku: 'SKU-DETTOL-015',
        category: 'Hygiene & Care',
        unitPrice: 340.0,
        currentStock: 280,
        minStockAlert: 40,
        warehouseLocation: 'Warehouse A - Ahmedabad',
        createdAt: now,
        updatedAt: now,
      },
    ];

    // 4. Seed Stock Movements
    this.stockMovements = [
      {
        id: 'sm-1',
        productId: 'prod-3',
        quantityChanged: -200,
        movementType: 'OUT',
        reason: 'Sale Dispatch (Sales Challan #CH-2026-0002)',
        createdBy: 'System (Auto)',
        createdAt: '2026-08-09T14:32:01Z',
      },
      {
        id: 'sm-2',
        productId: 'prod-1',
        quantityChanged: 200,
        movementType: 'IN',
        reason: 'PO Shipment Restock (#PO-IND-9912)',
        createdBy: 'Suresh Kumar (Warehouse)',
        createdAt: '2026-08-09T11:15:45Z',
      },
      {
        id: 'sm-3',
        productId: 'prod-2',
        quantityChanged: -5,
        movementType: 'OUT',
        reason: 'Damaged Goods Write-off',
        createdBy: 'Suresh Kumar (Warehouse)',
        createdAt: '2026-08-08T09:45:12Z',
      },
      {
        id: 'sm-4',
        productId: 'prod-6',
        quantityChanged: -150,
        movementType: 'OUT',
        reason: 'Sale Dispatch (Sales Challan #CH-2026-0003)',
        createdBy: 'System (Auto)',
        createdAt: '2026-08-07T16:20:00Z',
      },
    ];

    // 5. Seed Sales Challans (INR Pricing)
    const ch1Id = 'ch-1';
    const ch2Id = 'ch-2';
    const ch3Id = 'ch-3';
    const ch4Id = 'ch-4';

    this.challans = [
      {
        id: ch1Id,
        challanNumber: 'CH-2026-0001',
        customerId: 'cust-1',
        totalQuantity: 120,
        totalAmount: 197400.0, // (100 * 1850) + (20 * 620)
        deliveryAddress: '102 Ring Road Market, Ahmedabad, Gujarat 380002',
        remarks: 'Urgent festival stock dispatch requested.',
        status: 'DRAFT',
        createdBy: 'Rajesh Sharma',
        createdAt: '2026-08-09T10:00:00Z',
      },
      {
        id: ch2Id,
        challanNumber: 'CH-2026-0002',
        customerId: 'cust-2',
        totalQuantity: 300,
        totalAmount: 45800.0, // (200 * 215) + (100 * 28)
        deliveryAddress: '45 Station Road, Surat, Gujarat 395003',
        remarks: 'Standard truck delivery via Gujarat Freight',
        status: 'CONFIRMED',
        createdBy: 'Priya Patel',
        createdAt: '2026-08-08T15:20:00Z',
      },
      {
        id: ch3Id,
        challanNumber: 'CH-2026-0003',
        customerId: 'cust-3',
        totalQuantity: 150,
        totalAmount: 117000.0, // (150 * 780)
        deliveryAddress: 'Plot 12, GIDC Industrial Estate, Vadodara, Gujarat 390010',
        remarks: 'Handle with care - Edible Oil jars',
        status: 'CONFIRMED',
        createdBy: 'Suresh Kumar',
        createdAt: '2026-08-07T11:00:00Z',
      },
      {
        id: ch4Id,
        challanNumber: 'CH-2026-0004',
        customerId: 'cust-4',
        totalQuantity: 500,
        totalAmount: 42500.0, // (500 * 85)
        deliveryAddress: '88 Commercial Complex, MG Road, Hyderabad, Telangana 500001',
        remarks: 'Express delivery to South warehouse',
        status: 'CONFIRMED',
        createdAt: '2026-08-10T09:30:00Z',
        createdBy: 'Anjali Gupta',
      },
    ];

    this.sequenceCounter = 5;

    this.challanItems = [
      {
        id: 'item-1',
        challanId: ch1Id,
        productId: 'prod-1',
        productNameSnapshot: 'Basmati Rice Premium 25kg Bag',
        skuSnapshot: 'SKU-RICE-001',
        unitPriceSnapshot: 1850.0,
        quantity: 100,
      },
      {
        id: 'item-2',
        challanId: ch1Id,
        productId: 'prod-5',
        productNameSnapshot: 'Amul Pure Ghee 1L Tin',
        skuSnapshot: 'SKU-AMUL-005',
        unitPriceSnapshot: 620.0,
        quantity: 20,
      },
      {
        id: 'item-3',
        challanId: ch2Id,
        productId: 'prod-3',
        productNameSnapshot: 'Surf Excel Detergent 1kg Pack',
        skuSnapshot: 'SKU-SURF-003',
        unitPriceSnapshot: 215.0,
        quantity: 200,
      },
      {
        id: 'item-4',
        challanId: ch2Id,
        productId: 'prod-7',
        productNameSnapshot: 'Tata Salt Iodized 1kg Pack',
        skuSnapshot: 'SKU-SALT-007',
        unitPriceSnapshot: 28.0,
        quantity: 100,
      },
      {
        id: 'item-5',
        challanId: ch3Id,
        productId: 'prod-6',
        productNameSnapshot: 'Fortune Sunflower Oil 5L Jar',
        skuSnapshot: 'SKU-OIL-006',
        unitPriceSnapshot: 780.0,
        quantity: 150,
      },
      {
        id: 'item-6',
        challanId: ch4Id,
        productId: 'prod-8',
        productNameSnapshot: 'Everest Garam Masala 100g',
        skuSnapshot: 'SKU-SPICE-008',
        unitPriceSnapshot: 85.0,
        quantity: 500,
      },
    ];
  }

  // --- Users ---
  findUserByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  createUser(data: { name: string; email: string; passwordHash: string; role: Role }): User {
    const user: User = {
      id: `user-${Date.now()}`,
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      role: data.role,
      createdAt: new Date().toISOString(),
    };
    this.users.push(user);
    return user;
  }

  updateUser(id: string, updates: Partial<{ name: string; email: string; passwordHash: string }>): User | undefined {
    const user = this.findUserById(id);
    if (!user) return undefined;
    if (updates.name !== undefined) user.name = updates.name;
    if (updates.email !== undefined) user.email = updates.email.toLowerCase();
    if (updates.passwordHash !== undefined) user.passwordHash = updates.passwordHash;
    return user;
  }

  // --- Customers ---
  getCustomers(params: { page?: number; limit?: number; q?: string; status?: string; type?: string }) {
    let list = [...this.customers];

    if (params.q) {
      const q = params.q.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.mobile.toLowerCase().includes(q) ||
          c.businessName.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q)
      );
    }

    if (params.status && params.status !== 'All') {
      list = list.filter((c) => c.status.toUpperCase() === params.status?.toUpperCase());
    }

    if (params.type && params.type !== 'All') {
      list = list.filter((c) => c.customerType.toUpperCase() === params.type?.toUpperCase());
    }

    const total = list.length;
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const items = list.slice(startIndex, startIndex + limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  getCustomerById(id: string): Customer | undefined {
    return this.customers.find((c) => c.id === id);
  }

  createCustomer(data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Customer {
    const now = new Date().toISOString();
    const customer: Customer = {
      ...data,
      id: `cust-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    this.customers.unshift(customer);
    return customer;
  }

  updateCustomer(id: string, data: Partial<Customer>): Customer | undefined {
    const index = this.customers.findIndex((c) => c.id === id);
    if (index === -1) return undefined;
    this.customers[index] = {
      ...this.customers[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return this.customers[index];
  }

  deleteCustomer(id: string): boolean {
    const initialLen = this.customers.length;
    this.customers = this.customers.filter((c) => c.id !== id);
    this.followUpNotes = this.followUpNotes.filter((f) => f.customerId !== id);
    return this.customers.length < initialLen;
  }

  // --- FollowUp Notes ---
  getFollowUpNotes(customerId: string): FollowUpNote[] {
    return this.followUpNotes
      .filter((f) => f.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  addFollowUpNote(customerId: string, note: string, createdBy: string): FollowUpNote {
    const fn: FollowUpNote = {
      id: `note-${Date.now()}`,
      customerId,
      note,
      createdBy,
      createdAt: new Date().toISOString(),
    };
    this.followUpNotes.unshift(fn);
    return fn;
  }

  // --- Products & Inventory ---
  getProducts(params: { page?: number; limit?: number; q?: string; lowStock?: boolean }) {
    let list = [...this.products];

    if (params.q) {
      const q = params.q.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.warehouseLocation.toLowerCase().includes(q)
      );
    }

    if (params.lowStock) {
      list = list.filter((p) => p.currentStock <= p.minStockAlert);
    }

    const total = list.length;
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const items = list.slice(startIndex, startIndex + limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  getProductById(id: string): Product | undefined {
    return this.products.find((p) => p.id === id);
  }

  createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>, createdBy: string): Product {
    const now = new Date().toISOString();
    const product: Product = {
      ...data,
      id: `prod-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };

    // Check SKU uniqueness
    if (this.products.some((p) => p.sku.toLowerCase() === product.sku.toLowerCase())) {
      throw new Error(`Product with SKU '${product.sku}' already exists.`);
    }

    this.products.unshift(product);

    // Initial stock movement if stock > 0
    if (product.currentStock > 0) {
      this.createStockMovement({
        productId: product.id,
        quantityChanged: product.currentStock,
        movementType: 'IN',
        reason: 'Initial Inventory Entry',
        createdBy,
      });
    }

    return product;
  }

  updateProduct(id: string, data: Partial<Product>, updatedBy: string): Product | undefined {
    const product = this.getProductById(id);
    if (!product) return undefined;

    if (data.sku && data.sku.toLowerCase() !== product.sku.toLowerCase()) {
      if (this.products.some((p) => p.id !== id && p.sku.toLowerCase() === data.sku?.toLowerCase())) {
        throw new Error(`Product with SKU '${data.sku}' already exists.`);
      }
    }

    // Check if currentStock changed directly
    if (data.currentStock !== undefined && data.currentStock !== product.currentStock) {
      const diff = data.currentStock - product.currentStock;
      const type: MovementType = diff > 0 ? 'IN' : 'OUT';
      this.createStockMovement({
        productId: product.id,
        quantityChanged: Math.abs(diff),
        movementType: type,
        reason: 'Manual Inventory Adjustment',
        createdBy: updatedBy,
      });
    }

    const index = this.products.findIndex((p) => p.id === id);
    this.products[index] = {
      ...this.products[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return this.products[index];
  }

  deleteProduct(id: string): boolean {
    const initialLen = this.products.length;
    this.products = this.products.filter((p) => p.id !== id);
    this.stockMovements = this.stockMovements.filter((s) => s.productId !== id);
    return this.products.length < initialLen;
  }

  // --- Stock Movements ---
  getStockMovements(params: { productId?: string; page?: number; limit?: number }) {
    let list = [...this.stockMovements];
    if (params.productId) {
      list = list.filter((s) => s.productId === params.productId);
    }

    // Attach product name/SKU info
    const enriched = list.map((m) => {
      const prod = this.getProductById(m.productId);
      return {
        ...m,
        productName: prod ? prod.name : 'Unknown Product',
        productSku: prod ? prod.sku : 'N/A',
      };
    });

    enriched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = enriched.length;
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const items = enriched.slice(startIndex, startIndex + limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  createStockMovement(data: {
    productId: string;
    quantityChanged: number;
    movementType: MovementType;
    reason: string;
    createdBy: string;
  }): StockMovement {
    const product = this.getProductById(data.productId);
    if (!product) throw new Error(`Product ID ${data.productId} not found.`);

    if (data.movementType === 'OUT') {
      if (product.currentStock < data.quantityChanged) {
        throw new Error(
          `Insufficient stock for '${product.name}' (${product.sku}). Requested: ${data.quantityChanged}, Available: ${product.currentStock}`
        );
      }
      product.currentStock -= data.quantityChanged;
    } else {
      product.currentStock += data.quantityChanged;
    }
    product.updatedAt = new Date().toISOString();

    const sm: StockMovement = {
      id: `sm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      productId: data.productId,
      quantityChanged: data.movementType === 'OUT' ? -Math.abs(data.quantityChanged) : Math.abs(data.quantityChanged),
      movementType: data.movementType,
      reason: data.reason,
      createdBy: data.createdBy,
      createdAt: new Date().toISOString(),
    };

    this.stockMovements.unshift(sm);
    return sm;
  }

  // --- Challans ---
  private generateChallanNumber(): string {
    const year = new Date().getFullYear();
    if (year !== this.sequenceYear) {
      this.sequenceYear = year;
      this.sequenceCounter = 1;
    }
    const seqStr = String(this.sequenceCounter).padStart(4, '0');
    this.sequenceCounter++;
    return `CH-${year}-${seqStr}`;
  }

  getChallans(params: { page?: number; limit?: number; status?: string; customerId?: string; q?: string }) {
    let list = [...this.challans];

    if (params.status && params.status !== 'All') {
      list = list.filter((c) => c.status.toUpperCase() === params.status?.toUpperCase());
    }

    if (params.customerId) {
      list = list.filter((c) => c.customerId === params.customerId);
    }

    if (params.q) {
      const q = params.q.toLowerCase();
      list = list.filter((c) => {
        const cust = this.getCustomerById(c.customerId);
        return (
          c.challanNumber.toLowerCase().includes(q) ||
          (cust && cust.name.toLowerCase().includes(q)) ||
          (cust && cust.businessName.toLowerCase().includes(q))
        );
      });
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const enriched = list.map((c) => {
      const cust = this.getCustomerById(c.customerId);
      const items = this.getChallanItems(c.id);
      return {
        ...c,
        customerName: cust ? cust.name : 'Unknown Customer',
        customerBusiness: cust ? cust.businessName : '',
        items,
      };
    });

    const total = enriched.length;
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const items = enriched.slice(startIndex, startIndex + limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  getChallanById(id: string) {
    const c = this.challans.find((ch) => ch.id === id || ch.challanNumber === id);
    if (!c) return undefined;

    const cust = this.getCustomerById(c.customerId);
    const items = this.getChallanItems(c.id);

    return {
      ...c,
      customerName: cust ? cust.name : 'Unknown Customer',
      customerBusiness: cust ? cust.businessName : '',
      customerMobile: cust ? cust.mobile : '',
      customerEmail: cust ? cust.email : '',
      customerGst: cust ? cust.gstNumber : '',
      items,
    };
  }

  getChallanItems(challanId: string): ChallanItem[] {
    return this.challanItems.filter((item) => item.challanId === challanId);
  }

  createChallan(
    data: {
      customerId: string;
      deliveryAddress?: string;
      remarks?: string;
      status?: ChallanStatus;
      items: { productId: string; quantity: number }[];
    },
    createdBy: string
  ): SalesChallan {
    const cust = this.getCustomerById(data.customerId);
    if (!cust) throw new Error(`Customer ID ${data.customerId} not found.`);

    if (!data.items || data.items.length === 0) {
      throw new Error('Challan must contain at least one line item.');
    }

    const challanId = `ch-${Date.now()}`;
    const challanNumber = this.generateChallanNumber();
    const requestedStatus = data.status || 'DRAFT';

    let totalQuantity = 0;
    let totalAmount = 0;

    const itemsToCreate: ChallanItem[] = [];

    // Snapshot products
    for (const item of data.items) {
      const prod = this.getProductById(item.productId);
      if (!prod) throw new Error(`Product ID ${item.productId} not found.`);
      if (item.quantity <= 0) throw new Error(`Quantity for product ${prod.name} must be greater than 0.`);

      const lineTotal = prod.unitPrice * item.quantity;
      totalQuantity += item.quantity;
      totalAmount += lineTotal;

      itemsToCreate.push({
        id: `ci-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        challanId,
        productId: prod.id,
        productNameSnapshot: prod.name,
        skuSnapshot: prod.sku,
        unitPriceSnapshot: prod.unitPrice,
        quantity: item.quantity,
      });
    }

    const challan: SalesChallan = {
      id: challanId,
      challanNumber,
      customerId: data.customerId,
      totalQuantity,
      totalAmount,
      deliveryAddress: data.deliveryAddress || cust.address,
      remarks: data.remarks,
      status: 'DRAFT', // Set DRAFT first, then confirm if requested
      createdBy,
      createdAt: new Date().toISOString(),
    };

    this.challans.unshift(challan);
    this.challanItems.push(...itemsToCreate);

    if (requestedStatus === 'CONFIRMED') {
      // Validate & Confirm
      return this.confirmChallan(challanId, createdBy);
    }

    return this.getChallanById(challanId)!;
  }

  confirmChallan(id: string, confirmedBy: string): SalesChallan {
    const challan = this.challans.find((c) => c.id === id);
    if (!challan) throw new Error(`Challan ID ${id} not found.`);

    if (challan.status === 'CONFIRMED') {
      throw new Error(`Challan ${challan.challanNumber} is already confirmed.`);
    }

    if (challan.status === 'CANCELLED') {
      throw new Error(`Cannot confirm a cancelled challan.`);
    }

    const items = this.getChallanItems(challan.id);

    // CRITICAL BUSINESS LOGIC: Transaction validation step
    // 1) Validate stock for EVERY item first
    const insufficientStockItems: { name: string; sku: string; requested: number; available: number }[] = [];

    for (const item of items) {
      const product = this.getProductById(item.productId);
      if (!product) {
        throw new Error(`Product '${item.productNameSnapshot}' no longer exists.`);
      }
      if (product.currentStock < item.quantity) {
        insufficientStockItems.push({
          name: product.name,
          sku: product.sku,
          requested: item.quantity,
          available: product.currentStock,
        });
      }
    }

    if (insufficientStockItems.length > 0) {
      const detailStr = insufficientStockItems
        .map((i) => `'${i.name}' (${i.sku}): requested ${i.requested}, available ${i.available}`)
        .join('; ');
      const err = new Error(`Insufficient stock for items: ${detailStr}`);
      (err as any).statusCode = 409;
      (err as any).shortageDetails = insufficientStockItems;
      throw err;
    }

    // 2) If all items have sufficient stock, commit stock reduction & create stock movement records
    for (const item of items) {
      this.createStockMovement({
        productId: item.productId,
        quantityChanged: item.quantity,
        movementType: 'OUT',
        reason: `Sales Challan #${challan.challanNumber}`,
        createdBy: confirmedBy,
      });
    }

    challan.status = 'CONFIRMED';
    return this.getChallanById(id)!;
  }

  cancelChallan(id: string, cancelledBy: string): SalesChallan {
    const challan = this.challans.find((c) => c.id === id);
    if (!challan) throw new Error(`Challan ID ${id} not found.`);

    if (challan.status === 'CANCELLED') {
      return this.getChallanById(id)!;
    }

    // If it was CONFIRMED, reverse the stock movements
    if (challan.status === 'CONFIRMED') {
      const items = this.getChallanItems(challan.id);
      for (const item of items) {
        this.createStockMovement({
          productId: item.productId,
          quantityChanged: item.quantity,
          movementType: 'IN',
          reason: `Reversal for Cancelled Sales Challan #${challan.challanNumber}`,
          createdBy: cancelledBy,
        });
      }
    }

    challan.status = 'CANCELLED';
    return this.getChallanById(id)!;
  }

  // --- Dashboard Analytics ---
  getDashboardStats() {
    const totalCustomers = this.customers.length;
    const lowStockAlerts = this.products.filter((p) => p.currentStock <= p.minStockAlert).length;
    const draftChallans = this.challans.filter((c) => c.status === 'DRAFT').length;

    // Today's confirmed sales
    const todayStr = new Date().toISOString().split('T')[0];
    const todayConfirmedChallans = this.challans.filter(
      (c) => c.status === 'CONFIRMED' && c.createdAt.startsWith(todayStr)
    );
    const todaySales = todayConfirmedChallans.reduce((sum, c) => sum + c.totalAmount, 0);

    // Recent activity list
    const recentChallans = [...this.challans]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map((c) => {
        const cust = this.getCustomerById(c.customerId);
        return {
          id: c.challanNumber,
          customer: cust ? cust.name : 'Unknown',
          type: 'Challan',
          status: c.status === 'CONFIRMED' ? 'Completed' : c.status === 'DRAFT' ? 'Draft' : 'Cancelled',
          amount: c.totalAmount ? `₹${c.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-',
          date: c.createdAt,
        };
      });

    let formattedTodaySales = `₹${todaySales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    if (todaySales >= 100000) {
      formattedTodaySales = `₹${(todaySales / 100000).toFixed(1)} Lakh`;
    } else if (todaySales >= 1000) {
      formattedTodaySales = `₹${(todaySales / 1000).toFixed(1)}k`;
    }

    return {
      totalCustomers,
      totalCustomersChange: '+12%',
      lowStockAlerts,
      lowStockMessage: 'Requires action',
      draftChallans,
      draftChallansMessage: 'Pending review',
      todaySales: formattedTodaySales,
      todaySalesValue: todaySales,
      todaySalesChange: '+5.4%',
      recentActivity: recentChallans,
    };
  }
}

export const db = new MemoryDatabase();
