export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: string;
  price: number;
  mrp: number;
  stock: number;
  minThreshold: number;
  dosageForm: string;
  manufacturer: string;
  batchNumber: string;
  expiryDate: string; // YYYY-MM
  requiresPrescription: boolean;
  rackLocation: string;
  description: string;
  usageInstructions: string;
  composition: string;
  frontImage?: string;
  backImage?: string;
}

export interface CartItem {
  medicine: Medicine;
  quantity: number;
}

export interface OrderItem {
  medicineId: string;
  name: string;
  price: number;
  quantity: number;
  dosageForm: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  deliveryType: 'home_delivery' | 'store_pickup';
  village: string;
  address: string;
  landmark?: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: 'cash_on_delivery' | 'upi_on_delivery' | 'pay_at_clinic';
  status: 'pending' | 'packed' | 'out_for_delivery' | 'delivered' | 'cancelled';
  prescriptionAttached?: boolean;
  riderName?: string;
  riderPhone?: string;
  estimatedDelivery?: string;
}

export interface Appointment {
  id: string;
  appointmentNumber: string;
  createdAt: string;
  patientName: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  patientPhone: string;
  village: string;
  serviceType: string;
  appointmentDate: string;
  timeSlot: string;
  symptoms?: string;
  status: 'confirmed' | 'completed' | 'cancelled';
}

export interface CustomerInquiry {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  email?: string;
  village?: string;
  subject: string;
  message: string;
  type: 'inquiry' | 'feedback' | 'medicine_request';
  status: 'new' | 'reviewed';
}

export interface SalesReport {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  totalMedicines: number;
  lowStockCount: number;
  outOfStockCount: number;
  lowStockMedicines: { id: string; name: string; stock: number; minThreshold: number }[];
  topSellingMedicines: { name: string; quantity: number; revenue: number }[];
  villageOrders: Record<string, number>;
  appointmentCount: number;
}

export interface PrescriptionAnalysisResult {
  detectedMedicines: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
    matchedStoreMedicine?: {
      id: string;
      name: string;
      price: number;
      stock: number;
      inStock: boolean;
      dosageForm: string;
    };
  }[];
  generalAdvice: string;
  precautions: string[];
  doctorSpecialtyOrDiagnosis?: string;
  isClearImage: boolean;
  rawNotes?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface InvoiceItem {
  medicineId: string;
  name: string;
  batchNumber: string;
  expiryDate: string;
  dosageForm: string;
  mrp: number;
  rate: number;
  unitType?: 'strip' | 'piece'; // Full strip (पूरा पत्ता) vs loose piece (खुली गोली)
  piecesPerStrip?: number;
  quantity: number;
  amount: number;
}

export interface InvoiceReturnItem {
  id: string;
  returnDate: string;
  medicineId: string;
  name: string;
  quantityReturned: number;
  unitType: 'strip' | 'piece';
  refundAmount: number;
  reason: string;
}

export interface RetailInvoice {
  id: string;
  invoiceNumber: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  doctorName?: string;
  village: string;
  manualAddress?: string;
  paymentMode: 'Cash' | 'UPI' | 'Card' | 'Udhar/Credit';
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  gstPercent?: number; // 0, 5, 12, 18
  cgstAmount?: number;
  sgstAmount?: number;
  tax: number;
  grandTotal: number;
  notes?: string;
  status?: 'paid' | 'returned' | 'partially_returned';
  returns?: InvoiceReturnItem[];
}

export interface RefillReminder {
  id: string;
  customerName: string;
  customerPhone: string;
  medicineName: string;
  medicineId?: string;
  dosageSchedule: string;
  intervalDays: number;
  nextRefillDate: string;
  notifyVia: 'whatsapp' | 'sms' | 'both';
  status: 'active' | 'paused' | 'completed';
  createdAt: string;
}

export interface CustomerUser {
  id?: string;
  name: string;
  phone: string;
  village: string;
  address?: string;
  savedPrescriptions?: string[];
}

export interface CoverageLocation {
  id: string;
  name: string;
  distance: string;
  time: string;
  freeDelivery: boolean;
  description: string;
}
