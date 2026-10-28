import fs from 'fs';
import path from 'path';

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: string;
  price: number;
  mrp: number;
  stock: number;
  minThreshold: number;
  dosageForm: string; // e.g. "Tablet (Strip of 10)", "Syrup (100ml)", "Ointment (30g)"
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

export interface InvoiceItem {
  medicineId: string;
  name: string;
  batchNumber: string;
  expiryDate: string;
  dosageForm: string;
  mrp: number;
  rate: number;
  quantity: number;
  amount: number;
  unitType?: 'strip' | 'piece';
  piecesPerStrip?: number;
}

export interface InvoiceReturnRecord {
  id: string;
  returnDate: string;
  medicineId: string;
  name: string;
  quantityReturned: number;
  unitType: 'strip' | 'piece';
  refundAmount: number;
  reason?: string;
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
  gstPercent?: number;
  cgstAmount?: number;
  sgstAmount?: number;
  tax: number;
  grandTotal: number;
  notes?: string;
  status?: 'paid' | 'returned' | 'partially_returned';
  returns?: InvoiceReturnRecord[];
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

export interface CoverageLocation {
  id: string;
  name: string;
  distance: string;
  time: string;
  freeDelivery: boolean;
  description: string;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'pharmacy_store.json');

const INITIAL_MEDICINES: Medicine[] = [
  {
    id: "MED-101",
    name: "Dolo 650 Tablet",
    genericName: "Paracetamol 650mg",
    category: "Fever & Pain Relief",
    price: 31,
    mrp: 35,
    stock: 120,
    minThreshold: 25,
    dosageForm: "Tablet (Strip of 15)",
    manufacturer: "Micro Labs Ltd",
    batchNumber: "ML-2026-A12",
    expiryDate: "2027-08",
    requiresPrescription: false,
    rackLocation: "Rack A-01",
    description: "High efficacy antipyretic and analgesic for fever, headache, body ache and viral infections.",
    usageInstructions: "1 tablet after meals every 6-8 hours if fever persists. Max 4 tablets daily.",
    composition: "Paracetamol IP 650 mg",
    frontImage: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
    backImage: "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "MED-102",
    name: "Azithral 500 Tablet",
    genericName: "Azithromycin 500mg",
    category: "Antibiotics & Infections",
    price: 115,
    mrp: 130,
    stock: 45,
    minThreshold: 15,
    dosageForm: "Tablet (Strip of 5)",
    manufacturer: "Alembic Pharmaceuticals",
    batchNumber: "AL-8902",
    expiryDate: "2027-05",
    requiresPrescription: true,
    rackLocation: "Rack B-03",
    description: "Broad-spectrum macrolide antibiotic used for respiratory tract, ear, nose, throat and skin infections.",
    usageInstructions: "1 tablet once daily, 1 hour before or 2 hours after meals for 3-5 days as prescribed.",
    composition: "Azithromycin Dihydrate IP eq. to Azithromycin 500 mg",
    frontImage: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=80",
    backImage: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "MED-103",
    name: "Pantocid 40 Tablet",
    genericName: "Pantoprazole 40mg",
    category: "Gastro & Acidity",
    price: 98,
    mrp: 110,
    stock: 80,
    minThreshold: 20,
    dosageForm: "Tablet (Strip of 15)",
    manufacturer: "Sun Pharma",
    batchNumber: "SP-4491",
    expiryDate: "2027-11",
    requiresPrescription: false,
    rackLocation: "Rack A-04",
    description: "Proton pump inhibitor that reduces stomach acid production, relieving heartburn, GERD and gastritis.",
    usageInstructions: "Take 1 tablet in the morning empty stomach with water, 30 mins before breakfast.",
    composition: "Pantoprazole Gastro-resistant 40 mg",
    frontImage: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80",
    backImage: "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "MED-104",
    name: "Pan-D Capsule",
    genericName: "Pantoprazole 40mg + Domperidone 30mg",
    category: "Gastro & Acidity",
    price: 140,
    mrp: 165,
    stock: 65,
    minThreshold: 20,
    dosageForm: "Capsule (Strip of 15)",
    manufacturer: "Alkem Laboratories",
    batchNumber: "ALK-993",
    expiryDate: "2027-09",
    requiresPrescription: true,
    rackLocation: "Rack A-05",
    description: "Dual-action relief for acid reflux with nausea, vomiting sensations and severe indigestion.",
    usageInstructions: "Take 1 capsule early morning on an empty stomach.",
    composition: "Pantoprazole 40 mg + Domperidone 30 mg SR",
    frontImage: "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=600&auto=format&fit=crop&q=80",
    backImage: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "MED-105",
    name: "Montair-LC Tablet",
    genericName: "Montelukast 10mg + Levocetirizine 5mg",
    category: "Allergy, Cold & Cough",
    price: 185,
    mrp: 215,
    stock: 55,
    minThreshold: 15,
    dosageForm: "Tablet (Strip of 10)",
    manufacturer: "Cipla Ltd",
    batchNumber: "CIP-771",
    expiryDate: "2027-06",
    requiresPrescription: false,
    rackLocation: "Rack C-02",
    description: "Antiallergic medication for running nose, sneezing, pollen allergy, allergic rhinitis and nighttime wheezing.",
    usageInstructions: "1 tablet at bedtime with water.",
    composition: "Montelukast Sodium 10 mg + Levocetirizine Dihydrochloride 5 mg",
    frontImage: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
    backImage: "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "MED-106",
    name: "Augmentin 625 Duo Tablet",
    genericName: "Amoxicillin 500mg + Potassium Clavulanate 125mg",
    category: "Antibiotics & Infections",
    price: 195,
    mrp: 220,
    stock: 38,
    minThreshold: 15,
    dosageForm: "Tablet (Strip of 10)",
    manufacturer: "GlaxoSmithKline (GSK)",
    batchNumber: "GSK-201",
    expiryDate: "2027-04",
    requiresPrescription: true,
    rackLocation: "Rack B-01",
    description: "Potent antibacterial combination for bacterial infections of the chest, urinary tract, dental, and skin wounds.",
    usageInstructions: "1 tablet twice daily with food or milk for 5 to 7 days as directed by the doctor.",
    composition: "Amoxicillin 500 mg + Clavulanic Acid 125 mg",
    frontImage: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=80",
    backImage: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "MED-107",
    name: "Telma 40 Tablet",
    genericName: "Telmisartan 40mg",
    category: "Cardiac & Blood Pressure",
    price: 165,
    mrp: 190,
    stock: 70,
    minThreshold: 20,
    dosageForm: "Tablet (Strip of 30)",
    manufacturer: "Glenmark Pharmaceuticals",
    batchNumber: "GLN-382",
    expiryDate: "2028-01",
    requiresPrescription: true,
    rackLocation: "Rack D-01",
    description: "Angiotensin II receptor blocker used to maintain normal blood pressure and protect cardiac health.",
    usageInstructions: "1 tablet once daily at the same time each day, with or without food.",
    composition: "Telmisartan IP 40 mg",
    frontImage: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&auto=format&fit=crop&q=80",
    backImage: "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "MED-108",
    name: "Glycomet-GP 1 Tablet",
    genericName: "Glimepiride 1mg + Metformin 500mg SR",
    category: "Diabetes Care",
    price: 110,
    mrp: 125,
    stock: 60,
    minThreshold: 20,
    dosageForm: "Tablet (Strip of 15)",
    manufacturer: "USV Ltd",
    batchNumber: "USV-509",
    expiryDate: "2027-10",
    requiresPrescription: true,
    rackLocation: "Rack D-03",
    description: "Standard therapy for adult Type-2 Diabetes to effectively stabilize fasting and post-meal glucose.",
    usageInstructions: "1 tablet with the first main meal (usually breakfast) as prescribed.",
    composition: "Glimepiride 1 mg + Metformin Hydrochloride SR 500 mg",
    frontImage: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
    backImage: "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "MED-109",
    name: "Neurobion Forte Tablet",
    genericName: "Vitamin B-Complex with B12",
    category: "Vitamins & Supplements",
    price: 38,
    mrp: 44,
    stock: 140,
    minThreshold: 30,
    dosageForm: "Tablet (Strip of 30)",
    manufacturer: "Procter & Gamble Health",
    batchNumber: "PG-882",
    expiryDate: "2027-12",
    requiresPrescription: false,
    rackLocation: "Rack E-01",
    description: "Nerve nourishment and energy supplement for nerve numbness, tingling, fatigue, and mouth ulcers.",
    usageInstructions: "1 tablet daily after food.",
    composition: "Vitamin B1 10mg, B2 10mg, B3 45mg, B5 50mg, B6 3mg, B12 15mcg",
    frontImage: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80",
    backImage: "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "MED-110",
    name: "Shelcal 500 Tablet",
    genericName: "Calcium 500mg + Vitamin D3 250 IU",
    category: "Vitamins & Supplements",
    price: 115,
    mrp: 132,
    stock: 90,
    minThreshold: 25,
    dosageForm: "Tablet (Strip of 15)",
    manufacturer: "Torrent Pharmaceuticals",
    batchNumber: "TOR-614",
    expiryDate: "2027-08",
    requiresPrescription: false,
    rackLocation: "Rack E-02",
    description: "Strengthens bones and joints, relieves leg cramps, and aids calcium absorption for adults and seniors.",
    usageInstructions: "1 tablet daily after meal with water or warm milk.",
    composition: "Elemental Calcium 500 mg + Vitamin D3 250 IU",
    frontImage: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
    backImage: "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "MED-111",
    name: "Betadine 5% Antiseptic Ointment",
    genericName: "Povidone-Iodine 5% w/w",
    category: "First Aid & Wound Care",
    price: 72,
    mrp: 85,
    stock: 50,
    minThreshold: 15,
    dosageForm: "Ointment (Tube of 20g)",
    manufacturer: "Win-Medicare Pvt Ltd",
    batchNumber: "WM-301",
    expiryDate: "2027-07",
    requiresPrescription: false,
    rackLocation: "Rack F-01",
    description: "Gold standard antiseptic microbicidal ointment for cuts, scrapes, minor burns and infection prevention.",
    usageInstructions: "Clean wound gently, apply thin layer and cover with sterile dressing if needed.",
    composition: "Povidone-Iodine IP 5% w/w",
    frontImage: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&auto=format&fit=crop&q=80",
    backImage: "https://images.unsplash.com/photo-1584362917165-526a968579e8?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "MED-112",
    name: "Volini Pain Relief Gel",
    genericName: "Diclofenac Diethylamine + Methyl Salicylate + Menthol",
    category: "Pain Relief Ointments & Sprays",
    price: 125,
    mrp: 145,
    stock: 65,
    minThreshold: 15,
    dosageForm: "Gel (Tube of 50g)",
    manufacturer: "Sun Pharma",
    batchNumber: "VOL-908",
    expiryDate: "2027-09",
    requiresPrescription: false,
    rackLocation: "Rack F-03",
    description: "Fast absorbing deep heat relief for knee pain, backache, joint sprains, neck stiffness, and muscle pull.",
    usageInstructions: "Gently massage over affected area 3-4 times a day. Do not apply on open wounds.",
    composition: "Diclofenac Diethylamine 1.16%, Virgin Linseed Oil 3%, Methyl Salicylate 10%, Menthol 5%",
    frontImage: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&auto=format&fit=crop&q=80",
    backImage: "https://images.unsplash.com/photo-1584362917165-526a968579e8?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "MED-113",
    name: "Electral Powder ORS",
    genericName: "Oral Rehydration Salts (WHO Formula)",
    category: "Gastro & Acidity",
    price: 21,
    mrp: 23,
    stock: 200,
    minThreshold: 40,
    dosageForm: "Sachet (21.8g)",
    manufacturer: "FDC Ltd",
    batchNumber: "FDC-712",
    expiryDate: "2028-02",
    requiresPrescription: false,
    rackLocation: "Rack A-08",
    description: "WHO approved formula for immediate hydration during diarrhea, vomiting, summer heat exhaustion, and weakness.",
    usageInstructions: "Dissolve entire sachet contents in 1 litre of clean drinking water. Drink throughout the day.",
    composition: "Sodium Chloride, Potassium Chloride, Sodium Citrate, Dextrose Anhydrous",
    frontImage: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80",
    backImage: "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "MED-114",
    name: "Digene Antacid Liquid (Mint)",
    genericName: "Magnesium Hydroxide + Aluminium Hydroxide + Simethicone",
    category: "Gastro & Acidity",
    price: 145,
    mrp: 165,
    stock: 40,
    minThreshold: 12,
    dosageForm: "Syrup Bottle (200ml)",
    manufacturer: "Abbott Healthcare",
    batchNumber: "AB-402",
    expiryDate: "2027-03",
    requiresPrescription: false,
    rackLocation: "Rack A-06",
    description: "Fast soothing relief from burning acidity, gas bubbles, and uncomfortable stomach fullness.",
    usageInstructions: "Take 2 teaspoonfuls (10 ml) after meals or when acid symptoms arise.",
    composition: "Aluminium Hydroxide 300mg + Magnesium Hydroxide 25mg + Simethicone 25mg",
    frontImage: "https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=600&auto=format&fit=crop&q=80",
    backImage: "https://images.unsplash.com/photo-1583912267670-6575ad3736df?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "MED-115",
    name: "Accu-Chek Active 50 Test Strips",
    genericName: "Blood Glucose Test Strips",
    category: "Medical Devices & Testing",
    price: 890,
    mrp: 1025,
    stock: 22,
    minThreshold: 8,
    dosageForm: "Box of 50 Strips",
    manufacturer: "Roche Diabetes Care",
    batchNumber: "RO-781",
    expiryDate: "2027-02",
    requiresPrescription: false,
    rackLocation: "Rack G-01",
    description: "Accurate blood sugar monitoring strips compatible with Accu-Chek Active Glucometer for home tracking.",
    usageInstructions: "Insert strip into meter, apply small finger-prick blood drop, result in 5 seconds.",
    composition: "Diagnostic test strips with glucose dehydrogenase chemistry",
    frontImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80",
    backImage: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "MED-116",
    name: "Omron Digital Blood Pressure Monitor",
    genericName: "Automatic Upper Arm BP Monitor (HEM 7120)",
    category: "Medical Devices & Testing",
    price: 1950,
    mrp: 2350,
    stock: 8,
    minThreshold: 3,
    dosageForm: "Device Kit with Cuff & Batteries",
    manufacturer: "Omron Healthcare",
    batchNumber: "OM-902",
    expiryDate: "2031-12",
    requiresPrescription: false,
    rackLocation: "Rack G-02",
    description: "High accuracy one-touch automatic BP and pulse rate reader with hypertension indicator.",
    usageInstructions: "Wrap cuff around upper arm at heart level, sit upright, and press Start button.",
    composition: "Oscillometric blood pressure measurement instrument",
    frontImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80",
    backImage: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "MED-117",
    name: "Ciplox 500 Tablet",
    genericName: "Ciprofloxacin 500mg",
    category: "Antibiotics & Infections",
    price: 45,
    mrp: 52,
    stock: 58,
    minThreshold: 15,
    dosageForm: "Tablet (Strip of 10)",
    manufacturer: "Cipla Ltd",
    batchNumber: "CIP-338",
    expiryDate: "2027-09",
    requiresPrescription: true,
    rackLocation: "Rack B-04",
    description: "Fluoroquinolone antibiotic for intestinal gastro infections, typhoid, urinary tract and skin infections.",
    usageInstructions: "1 tablet twice daily with plentiful water for recommended days.",
    composition: "Ciprofloxacin Hydrochloride eq. to Ciprofloxacin 500 mg",
    frontImage: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=80",
    backImage: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "MED-118",
    name: "Combiflam Tablet",
    genericName: "Ibuprofen 400mg + Paracetamol 325mg",
    category: "Fever & Pain Relief",
    price: 44,
    mrp: 50,
    stock: 95,
    minThreshold: 20,
    dosageForm: "Tablet (Strip of 20)",
    manufacturer: "Sanofi India Ltd",
    batchNumber: "SNF-441",
    expiryDate: "2027-10",
    requiresPrescription: false,
    rackLocation: "Rack A-02",
    description: "Combination analgesic and anti-inflammatory for joint pain, muscle strain, toothache, and fever.",
    usageInstructions: "1 tablet after meals with milk or water. Not recommended on empty stomach.",
    composition: "Ibuprofen 400 mg + Paracetamol 325 mg",
    frontImage: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
    backImage: "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "MED-119",
    name: "Cheston Cold Tablet",
    genericName: "Cetirizine + Phenylephrine + Paracetamol",
    category: "Allergy, Cold & Cough",
    price: 52,
    mrp: 60,
    stock: 75,
    minThreshold: 20,
    dosageForm: "Tablet (Strip of 10)",
    manufacturer: "Cipla Ltd",
    batchNumber: "CC-812",
    expiryDate: "2027-07",
    requiresPrescription: false,
    rackLocation: "Rack C-01",
    description: "Clears blocked nose, reduces watery eyes, soothes sinus congestion and eases cold headaches.",
    usageInstructions: "1 tablet twice daily after meals as needed for cold relief.",
    composition: "Paracetamol 325mg, Phenylephrine HCl 10mg, Cetirizine Dihydrochloride 5mg",
    frontImage: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
    backImage: "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "MED-120",
    name: "Vicks VapoRub 50ml",
    genericName: "Menthol, Camphor & Eucalyptus Oil Ointment",
    category: "Allergy, Cold & Cough",
    price: 155,
    mrp: 175,
    stock: 60,
    minThreshold: 15,
    dosageForm: "Jar (50ml)",
    manufacturer: "Procter & Gamble",
    batchNumber: "VVR-202",
    expiryDate: "2028-03",
    requiresPrescription: false,
    rackLocation: "Rack C-05",
    description: "Ayurvedic vaporizing ointment for quick relief from chest congestion, stuffy nose and breathing difficulty.",
    usageInstructions: "Apply gently on chest, throat and back. Or add 1 spoonful to steaming hot water for inhalation.",
    composition: "Pudina ke phool 2.82g, Karpoor 5.25g, Ajwain ke phool 0.10g, Nilgiri tel 1.49ml, Turpine ka tel 5.57ml",
    frontImage: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&auto=format&fit=crop&q=80",
    backImage: "https://images.unsplash.com/photo-1584362917165-526a968579e8?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "MED-121",
    name: "Zincovit Tablet",
    genericName: "Multivitamin with Multimineral & Zinc",
    category: "Vitamins & Supplements",
    price: 110,
    mrp: 125,
    stock: 85,
    minThreshold: 20,
    dosageForm: "Tablet (Strip of 15)",
    manufacturer: "Apex Laboratories",
    batchNumber: "APX-621",
    expiryDate: "2027-11",
    requiresPrescription: false,
    rackLocation: "Rack E-04",
    description: "Daily immunity booster and nutritional recovery formula following fever, viral illness or fatigue.",
    usageInstructions: "1 tablet once daily after lunch or breakfast with plenty of water.",
    composition: "Zinc, Vitamin C, Vitamin B-Complex, Vitamin A, Vitamin E & trace minerals",
    frontImage: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80",
    backImage: "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "MED-122",
    name: "Sterile Bandage & Gauze Kit",
    genericName: "Cotton Roll + Crepe Bandage + Micropore Tape",
    category: "First Aid & Wound Care",
    price: 85,
    mrp: 100,
    stock: 70,
    minThreshold: 15,
    dosageForm: "Pack (3 Essential Items)",
    manufacturer: "Dettol / CareMed",
    batchNumber: "KIT-119",
    expiryDate: "2029-01",
    requiresPrescription: false,
    rackLocation: "Rack F-05",
    description: "Essential home emergency dressing kit for sprains, minor bleeding, wound protection and sports cuts.",
    usageInstructions: "Use sterile cotton with antiseptic, wrap gently with gauze, secure with micropore tape.",
    composition: "100% Medical Grade Absorbent Cotton & Breathable Crepe",
    frontImage: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80",
    backImage: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&auto=format&fit=crop&q=80"
  }
];

const INITIAL_ORDERS: Order[] = [
  {
    id: "ORD-9001",
    orderNumber: "IP-2026-1001",
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    customerName: "Rameshwar Tiwari",
    customerPhone: "9839120482",
    deliveryType: "home_delivery",
    village: "Sidhawe",
    address: "Near Primary School, Sidhawe Main Road",
    landmark: "Opposite Shiv Temple",
    notes: "Please deliver before 4 PM",
    items: [
      { medicineId: "MED-101", name: "Dolo 650 Tablet", price: 31, quantity: 2, dosageForm: "Tablet (Strip of 15)" },
      { medicineId: "MED-105", name: "Montair-LC Tablet", price: 185, quantity: 1, dosageForm: "Tablet (Strip of 10)" },
      { medicineId: "MED-113", name: "Electral Powder ORS", price: 21, quantity: 4, dosageForm: "Sachet (21.8g)" }
    ],
    subtotal: 331,
    deliveryFee: 0,
    total: 331,
    paymentMethod: "cash_on_delivery",
    status: "delivered",
    prescriptionAttached: false
  },
  {
    id: "ORD-9002",
    orderNumber: "IP-2026-1002",
    createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    customerName: "Smt. Sunita Devi",
    customerPhone: "9125489012",
    deliveryType: "home_delivery",
    village: "Kaulamundera",
    address: "House 42, North Lane, Kaulamundera",
    landmark: "Behind Panchayat Bhavan",
    notes: "Call when you reach the bridge",
    items: [
      { medicineId: "MED-107", name: "Telma 40 Tablet", price: 165, quantity: 2, dosageForm: "Tablet (Strip of 30)" },
      { medicineId: "MED-109", name: "Neurobion Forte Tablet", price: 38, quantity: 1, dosageForm: "Tablet (Strip of 30)" }
    ],
    subtotal: 368,
    deliveryFee: 0,
    total: 368,
    paymentMethod: "upi_on_delivery",
    status: "out_for_delivery",
    prescriptionAttached: true
  },
  {
    id: "ORD-9003",
    orderNumber: "IP-2026-1003",
    createdAt: new Date(Date.now() - 3600000 * 0.5).toISOString(),
    customerName: "Anand Verma",
    customerPhone: "9794103891",
    deliveryType: "home_delivery",
    village: "Pachrukhiya",
    address: "Goraya Ghat Road, Pachrukhiya Market",
    landmark: "Near Market Gate",
    items: [
      { medicineId: "MED-112", name: "Volini Pain Relief Gel", price: 125, quantity: 1, dosageForm: "Gel (Tube of 50g)" },
      { medicineId: "MED-111", name: "Betadine 5% Antiseptic Ointment", price: 72, quantity: 1, dosageForm: "Ointment (Tube of 20g)" },
      { medicineId: "MED-122", name: "Sterile Bandage & Gauze Kit", price: 85, quantity: 1, dosageForm: "Pack (3 Essential Items)" }
    ],
    subtotal: 282,
    deliveryFee: 0,
    total: 282,
    paymentMethod: "cash_on_delivery",
    status: "pending",
    prescriptionAttached: false
  }
];

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: "APT-501",
    appointmentNumber: "CLINIC-2026-001",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    patientName: "Babban Yadav",
    patientAge: 58,
    patientGender: "Male",
    patientPhone: "9450381920",
    village: "Bhagona Tola",
    serviceType: "BP & Blood Sugar Screening",
    appointmentDate: new Date().toISOString().split('T')[0],
    timeSlot: "10:30 AM - 11:00 AM",
    symptoms: "Dizziness and routine monthly hypertension check",
    status: "completed"
  },
  {
    id: "APT-502",
    appointmentNumber: "CLINIC-2026-002",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    patientName: "Pooja Kushwaha",
    patientAge: 27,
    patientGender: "Female",
    patientPhone: "9918234509",
    village: "Paraskhan",
    serviceType: "Doctor Consultation",
    appointmentDate: new Date().toISOString().split('T')[0],
    timeSlot: "04:30 PM - 05:00 PM",
    symptoms: "Viral fever, throat irritation since 2 days",
    status: "confirmed"
  },
  {
    id: "APT-503",
    appointmentNumber: "CLINIC-2026-003",
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    patientName: "Santosh Prajapati",
    patientAge: 42,
    patientGender: "Male",
    patientPhone: "9695018374",
    village: "Tarkulwa",
    serviceType: "First Aid & Wound Dressing",
    appointmentDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    timeSlot: "11:00 AM - 11:30 AM",
    symptoms: "Minor farm cut on right hand, dressing renewal",
    status: "confirmed"
  }
];

const INITIAL_INQUIRIES: CustomerInquiry[] = [
  {
    id: "INQ-201",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    name: "Mohan Lal",
    phone: "9118992341",
    village: "Sirwania",
    subject: "Insulin Cartridge Availability",
    message: "Namaste, do you keep Lantus 100IU insulin cartridges in stock or can you arrange them by evening?",
    type: "medicine_request",
    status: "reviewed"
  },
  {
    id: "INQ-202",
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    name: "Vinay Singh",
    phone: "9838001122",
    village: "Pachrukhiya",
    subject: "Home Delivery Praise",
    message: "Thank you for sending medicines to my elderly mother within 30 minutes in Pachrukhiya. Excellent service!",
    type: "feedback",
    status: "reviewed"
  }
];

interface PharmacyStoreData {
  medicines: Medicine[];
  orders: Order[];
  appointments: Appointment[];
  inquiries: CustomerInquiry[];
  invoices: RetailInvoice[];
  refillReminders: RefillReminder[];
  coverageLocations: CoverageLocation[];
}

const INITIAL_COVERAGE_LOCATIONS: CoverageLocation[] = [
  { id: "LOC-1", name: "Pachrukhiya", distance: "0 km", time: "10 mins", freeDelivery: true, description: "Local town center & market area" },
  { id: "LOC-2", name: "Goraya Ghat Road", distance: "0.5 km", time: "10 mins", freeDelivery: true, description: "Direct road corridor & clinic" },
  { id: "LOC-3", name: "Bhagona Tola", distance: "2.1 km", time: "15-20 mins", freeDelivery: true, description: "Doorstep delivery available" },
  { id: "LOC-4", name: "Sidhawe", distance: "2.8 km", time: "15-25 mins", freeDelivery: true, description: "Near Primary School & Temple" },
  { id: "LOC-5", name: "Paraskhan", distance: "3.6 km", time: "20-30 mins", freeDelivery: true, description: "Fast delivery on two-wheelers" },
  { id: "LOC-6", name: "Kaulamundera", distance: "4.0 km", time: "20-30 mins", freeDelivery: true, description: "Full coverage across all tolas" },
  { id: "LOC-7", name: "Sirwania", distance: "4.8 km", time: "25-35 mins", freeDelivery: true, description: "Daily delivery schedules" },
  { id: "LOC-8", name: "Tarkulwa", distance: "6.2 km", time: "30-40 mins", freeDelivery: true, description: "Connecting hub service" }
];

const INITIAL_REFILL_REMINDERS: RefillReminder[] = [
  {
    id: "REF-101",
    customerName: "Satish Mishra",
    customerPhone: "9838120033",
    medicineName: "Telma 40 Tablet",
    dosageSchedule: "1 tablet daily after breakfast (Blood Pressure)",
    intervalDays: 30,
    nextRefillDate: "2026-11-15",
    notifyVia: "whatsapp",
    status: "active",
    createdAt: new Date().toISOString()
  },
  {
    id: "REF-102",
    customerName: "Mohan Lal",
    customerPhone: "9118992341",
    medicineName: "Zincovit Tablet",
    dosageSchedule: "1 tablet daily (Immunity multivitamin)",
    intervalDays: 15,
    nextRefillDate: "2026-11-05",
    notifyVia: "both",
    status: "active",
    createdAt: new Date().toISOString()
  }
];

let store: PharmacyStoreData = {
  medicines: INITIAL_MEDICINES,
  orders: INITIAL_ORDERS,
  appointments: INITIAL_APPOINTMENTS,
  inquiries: INITIAL_INQUIRIES,
  invoices: [],
  refillReminders: INITIAL_REFILL_REMINDERS,
  coverageLocations: INITIAL_COVERAGE_LOCATIONS
};

// Ensure data directory exists and load file if present
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (fs.existsSync(DB_FILE)) {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    store = JSON.parse(raw);
    if (!store.invoices) store.invoices = [];
    if (!store.refillReminders) store.refillReminders = INITIAL_REFILL_REMINDERS;
    if (!store.coverageLocations || store.coverageLocations.length === 0) store.coverageLocations = INITIAL_COVERAGE_LOCATIONS;
    // If medicines in file don't have frontImage, hydrate from initial
    let needsUpdate = false;
    store.medicines = store.medicines.map((m) => {
      const initMatch = INITIAL_MEDICINES.find(im => im.id === m.id);
      if (!m.frontImage && initMatch?.frontImage) {
        needsUpdate = true;
        return { ...m, frontImage: initMatch.frontImage, backImage: initMatch.backImage };
      }
      return m;
    });
    if (needsUpdate) {
      fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), 'utf-8');
    }
  } else {
    fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), 'utf-8');
  }
} catch (err) {
  console.warn("Using in-memory DB store fallback:", err);
}

function persistStore() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error("Failed to write pharmacy store:", err);
  }
}

export const db = {
  // Medicines
  getMedicines: (query?: string, category?: string) => {
    let list = store.medicines;
    if (category && category !== 'All') {
      list = list.filter(m => m.category.toLowerCase() === category.toLowerCase());
    }
    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      list = list.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.genericName.toLowerCase().includes(q) ||
        m.composition.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q)
      );
    }
    return list;
  },

  getMedicineById: (id: string) => {
    return store.medicines.find(m => m.id === id);
  },

  addMedicine: (data: Omit<Medicine, 'id'>) => {
    const newId = `MED-${Date.now().toString().slice(-4)}`;
    const newMed: Medicine = {
      ...data,
      id: newId
    };
    store.medicines.unshift(newMed);
    persistStore();
    return newMed;
  },

  updateMedicine: (id: string, updates: Partial<Medicine>) => {
    const index = store.medicines.findIndex(m => m.id === id);
    if (index === -1) return null;
    store.medicines[index] = { ...store.medicines[index], ...updates };
    persistStore();
    return store.medicines[index];
  },

  deleteMedicine: (id: string) => {
    const index = store.medicines.findIndex(m => m.id === id);
    if (index === -1) return false;
    store.medicines.splice(index, 1);
    persistStore();
    return true;
  },

  // Orders
  getOrders: () => {
    return [...store.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getOrderById: (id: string) => {
    return store.orders.find(o => o.id === id || o.orderNumber === id);
  },

  createOrder: (orderData: {
    customerName: string;
    customerPhone: string;
    deliveryType: 'home_delivery' | 'store_pickup';
    village: string;
    address: string;
    landmark?: string;
    notes?: string;
    items: { medicineId: string; quantity: number }[];
    paymentMethod: 'cash_on_delivery' | 'upi_on_delivery' | 'pay_at_clinic';
    prescriptionAttached?: boolean;
  }) => {
    const populatedItems: OrderItem[] = [];
    let subtotal = 0;

    for (const item of orderData.items) {
      const med = store.medicines.find(m => m.id === item.medicineId);
      if (!med) {
        throw new Error(`Medicine not found: ${item.medicineId}`);
      }
      if (med.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${med.name}. Available: ${med.stock}`);
      }
      med.stock -= item.quantity;
      subtotal += med.price * item.quantity;
      populatedItems.push({
        medicineId: med.id,
        name: med.name,
        price: med.price,
        quantity: item.quantity,
        dosageForm: med.dosageForm
      });
    }

    // Generate guaranteed unique order number: IP-YYMMDD-XXXX
    const now = new Date();
    const yymmdd = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    let orderNum = '';
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 100) {
      const rand = Math.floor(1000 + Math.random() * 9000);
      orderNum = `IP-${yymmdd}-${rand}`;
      if (!store.orders.some(o => o.orderNumber === orderNum)) {
        isUnique = true;
      }
      attempts++;
    }
    if (!isUnique) {
      orderNum = `IP-${yymmdd}-${Date.now().toString().slice(-4)}`;
    }

    const newOrder: Order = {
      id: `ORD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      orderNumber: orderNum,
      createdAt: new Date().toISOString(),
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      deliveryType: orderData.deliveryType,
      village: orderData.village,
      address: orderData.address,
      landmark: orderData.landmark,
      notes: orderData.notes,
      items: populatedItems,
      subtotal,
      deliveryFee: 0,
      total: subtotal,
      paymentMethod: orderData.paymentMethod,
      status: 'pending',
      prescriptionAttached: !!orderData.prescriptionAttached
    };

    store.orders.unshift(newOrder);
    persistStore();
    return newOrder;
  },

  updateOrderStatus: (id: string, status: Order['status'], riderDetails?: { riderName?: string; riderPhone?: string; estimatedDelivery?: string }) => {
    const order = store.orders.find(o => o.id === id || o.orderNumber === id);
    if (!order) return null;
    
    if (status === 'cancelled' && order.status !== 'cancelled') {
      for (const it of order.items) {
        const med = store.medicines.find(m => m.id === it.medicineId);
        if (med) {
          med.stock += it.quantity;
        }
      }
    }
    
    order.status = status;
    if (riderDetails?.riderName) order.riderName = riderDetails.riderName;
    if (riderDetails?.riderPhone) order.riderPhone = riderDetails.riderPhone;
    if (riderDetails?.estimatedDelivery) order.estimatedDelivery = riderDetails.estimatedDelivery;

    if (status === 'out_for_delivery' && !order.riderName) {
      order.riderName = 'Rameshwar Yadav (Ishwar Express Rider)';
      order.riderPhone = '9118137582';
      order.estimatedDelivery = '20-35 mins';
    }

    persistStore();
    return order;
  },

  trackOrder: (query: string) => {
    const term = query.trim().toLowerCase().replace(/^#/, '');
    if (!term) return [];
    const cleanDigits = term.replace(/\D/g, '');
    return store.orders.filter(o => {
      const matchOrderNum = o.orderNumber.toLowerCase() === term || o.orderNumber.toLowerCase().includes(term);
      const matchId = o.id.toLowerCase() === term || o.id.toLowerCase().includes(term);
      const matchPhone = cleanDigits.length >= 4 && o.customerPhone.replace(/\D/g, '').includes(cleanDigits);
      return matchOrderNum || matchId || matchPhone;
    });
  },

  // Appointments
  getAppointments: () => {
    return [...store.appointments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  createAppointment: (data: {
    patientName: string;
    patientAge: number;
    patientGender: 'Male' | 'Female' | 'Other';
    patientPhone: string;
    village: string;
    serviceType: string;
    appointmentDate: string;
    timeSlot: string;
    symptoms?: string;
  }) => {
    const aptNum = `CLINIC-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newApt: Appointment = {
      id: `APT-${Date.now()}`,
      appointmentNumber: aptNum,
      createdAt: new Date().toISOString(),
      ...data,
      status: 'confirmed'
    };
    store.appointments.unshift(newApt);
    persistStore();
    return newApt;
  },

  updateAppointmentStatus: (id: string, status: Appointment['status']) => {
    const apt = store.appointments.find(a => a.id === id || a.appointmentNumber === id);
    if (!apt) return null;
    apt.status = status;
    persistStore();
    return apt;
  },

  // Inquiries
  getInquiries: () => {
    return [...store.inquiries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  createInquiry: (data: Omit<CustomerInquiry, 'id' | 'createdAt' | 'status'>) => {
    const newInquiry: CustomerInquiry = {
      id: `INQ-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'new',
      ...data
    };
    store.inquiries.unshift(newInquiry);
    persistStore();
    return newInquiry;
  },

  // Reports
  getReports: () => {
    const totalOrders = store.orders.length;
    const pendingOrders = store.orders.filter(o => o.status === 'pending').length;
    const deliveredOrders = store.orders.filter(o => o.status === 'delivered').length;
    const totalRevenue = store.orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0);

    const lowStockMedicines = store.medicines.filter(m => m.stock <= m.minThreshold);
    const outOfStockMedicines = store.medicines.filter(m => m.stock === 0);

    const medicineSalesMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
    for (const o of store.orders) {
      if (o.status === 'cancelled') continue;
      for (const item of o.items) {
        if (!medicineSalesMap[item.medicineId]) {
          medicineSalesMap[item.medicineId] = {
            name: item.name,
            quantity: 0,
            revenue: 0
          };
        }
        medicineSalesMap[item.medicineId].quantity += item.quantity;
        medicineSalesMap[item.medicineId].revenue += item.price * item.quantity;
      }
    }
    const topSellingMedicines = Object.values(medicineSalesMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const villageOrders: Record<string, number> = {};
    for (const o of store.orders) {
      villageOrders[o.village] = (villageOrders[o.village] || 0) + 1;
    }

    return {
      totalRevenue,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      totalMedicines: store.medicines.length,
      lowStockCount: lowStockMedicines.length,
      outOfStockCount: outOfStockMedicines.length,
      lowStockMedicines: lowStockMedicines.map(m => ({ id: m.id, name: m.name, stock: m.stock, minThreshold: m.minThreshold })),
      topSellingMedicines,
      villageOrders,
      appointmentCount: store.appointments.length
    };
  },

  // Retail Counter Billing (POS)
  getInvoices: () => {
    return store.invoices || [];
  },

  createInvoice: (invoiceData: {
    customerName: string;
    customerPhone: string;
    doctorName?: string;
    village: string;
    manualAddress?: string;
    paymentMode: 'Cash' | 'UPI' | 'Card' | 'Udhar/Credit';
    items: {
      medicineId: string;
      quantity: number;
      rate?: number;
      unitType?: 'strip' | 'piece';
      piecesPerStrip?: number;
    }[];
    discount?: number;
    gstPercent?: number;
    notes?: string;
  }) => {
    const populatedItems: InvoiceItem[] = [];
    let subtotal = 0;

    for (const item of invoiceData.items) {
      const med = store.medicines.find(m => m.id === item.medicineId);
      if (!med) {
        throw new Error(`Medicine not found: ${item.medicineId}`);
      }

      // Determine pieces per strip if piece mode
      let piecesPerStrip = item.piecesPerStrip || 10;
      const match = med.dosageForm.match(/(\d+)\s*(strip|tablets?|capsules?|pieces?)/i) || med.dosageForm.match(/Strip of (\d+)/i);
      if (match && match[1]) {
        piecesPerStrip = parseInt(match[1], 10) || 10;
      }

      const unitType = item.unitType || 'strip';
      const stockToDeduct = unitType === 'piece' ? item.quantity / piecesPerStrip : item.quantity;

      if (med.stock < stockToDeduct) {
        throw new Error(`Insufficient stock for ${med.name}. Available: ${med.stock} strips`);
      }

      // Deduct stock from real-time inventory with 2 decimals precision
      med.stock = Math.max(0, Number((med.stock - stockToDeduct).toFixed(2)));

      const rate = item.rate !== undefined ? item.rate : (unitType === 'piece' ? Math.ceil(med.price / piecesPerStrip) : med.price);
      const amount = Number((rate * item.quantity).toFixed(2));
      subtotal += amount;

      populatedItems.push({
        medicineId: med.id,
        name: med.name,
        batchNumber: med.batchNumber,
        expiryDate: med.expiryDate,
        dosageForm: med.dosageForm,
        mrp: med.mrp,
        rate,
        unitType,
        piecesPerStrip,
        quantity: item.quantity,
        amount
      });
    }

    const discount = Number(invoiceData.discount || 0);
    const gstPercent = Number(invoiceData.gstPercent || 0);
    const taxableAmount = Math.max(0, subtotal - discount);
    const totalTax = Number(((taxableAmount * gstPercent) / 100).toFixed(2));
    const cgstAmount = Number((totalTax / 2).toFixed(2));
    const sgstAmount = Number((totalTax / 2).toFixed(2));
    const grandTotal = Math.round(taxableAmount + totalTax);

    const invNum = `BILL-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const newInvoice: RetailInvoice = {
      id: `INV-${Date.now()}`,
      invoiceNumber: invNum,
      createdAt: new Date().toISOString(),
      customerName: invoiceData.customerName || 'Walk-in Customer',
      customerPhone: invoiceData.customerPhone || 'N/A',
      doctorName: invoiceData.doctorName || 'Self / OTC',
      village: invoiceData.village || 'Pachrukhiya',
      manualAddress: invoiceData.manualAddress || undefined,
      paymentMode: invoiceData.paymentMode || 'Cash',
      items: populatedItems,
      subtotal: Number(subtotal.toFixed(2)),
      discount,
      gstPercent,
      cgstAmount,
      sgstAmount,
      tax: totalTax,
      grandTotal,
      notes: invoiceData.notes,
      status: 'paid',
      returns: []
    };

    if (!store.invoices) store.invoices = [];
    store.invoices.unshift(newInvoice);
    persistStore();
    return newInvoice;
  },

  returnInvoiceItem: (invoiceId: string, returnData: {
    medicineId: string;
    quantity: number;
    unitType: 'strip' | 'piece';
    reason: string;
  }) => {
    const inv = store.invoices.find(i => i.id === invoiceId || i.invoiceNumber === invoiceId);
    if (!inv) throw new Error('Invoice not found');

    const item = inv.items.find(it => it.medicineId === returnData.medicineId);
    if (!item) throw new Error('Item not found in invoice');

    const alreadyReturned = (inv.returns || [])
      .filter(r => r.medicineId === returnData.medicineId)
      .reduce((sum, r) => sum + r.quantityReturned, 0);

    if (alreadyReturned + returnData.quantity > item.quantity) {
      throw new Error(`Cannot return more than purchased. Purchased: ${item.quantity}, Already returned: ${alreadyReturned}`);
    }

    // Restore inventory
    const med = store.medicines.find(m => m.id === returnData.medicineId);
    if (med) {
      const piecesPerStrip = item.piecesPerStrip || 10;
      const stockToAdd = returnData.unitType === 'piece' ? returnData.quantity / piecesPerStrip : returnData.quantity;
      med.stock = Number((med.stock + stockToAdd).toFixed(2));
    }

    const refundAmount = Number((item.rate * returnData.quantity).toFixed(2));
    if (!inv.returns) inv.returns = [];
    inv.returns.push({
      id: `RET-${Date.now()}`,
      returnDate: new Date().toISOString(),
      medicineId: item.medicineId,
      name: item.name,
      quantityReturned: returnData.quantity,
      unitType: returnData.unitType,
      refundAmount,
      reason: returnData.reason || 'Customer Return'
    });

    const totalReturnedQty = inv.returns.reduce((s, r) => s + r.quantityReturned, 0);
    const totalItemQty = inv.items.reduce((s, it) => s + it.quantity, 0);
    inv.status = totalReturnedQty >= totalItemQty ? 'returned' : 'partially_returned';

    persistStore();
    return inv;
  },

  // Expiry Dashboard
  getExpiryReport: () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1 to 12

    const report = store.medicines.map(m => {
      const [expYearStr, expMonthStr] = (m.expiryDate || '2027-12').split('-');
      const expYear = parseInt(expYearStr, 10) || currentYear;
      const expMonth = parseInt(expMonthStr, 10) || 12;

      const diffMonths = (expYear - currentYear) * 12 + (expMonth - currentMonth);
      const approxDaysLeft = Math.round(diffMonths * 30.5);

      let status: 'expired' | 'critical' | 'warning' | 'good' = 'good';
      if (diffMonths <= 0) {
        status = 'expired';
      } else if (diffMonths <= 2) {
        status = 'critical'; // < 60 days
      } else if (diffMonths <= 6) {
        status = 'warning'; // < 180 days
      }

      return {
        id: m.id,
        name: m.name,
        genericName: m.genericName,
        category: m.category,
        batchNumber: m.batchNumber,
        rackLocation: m.rackLocation,
        stock: m.stock,
        mrp: m.mrp,
        price: m.price,
        expiryDate: m.expiryDate,
        diffMonths,
        approxDaysLeft,
        status
      };
    });

    return {
      expired: report.filter(m => m.status === 'expired'),
      critical: report.filter(m => m.status === 'critical'),
      warning: report.filter(m => m.status === 'warning'),
      good: report.filter(m => m.status === 'good'),
      totalMonitored: report.length
    };
  },

  // Refill Reminders
  getRefillReminders: () => {
    return store.refillReminders || [];
  },

  createRefillReminder: (data: {
    customerName: string;
    customerPhone: string;
    medicineName: string;
    medicineId?: string;
    dosageSchedule: string;
    intervalDays: number;
    nextRefillDate: string;
    notifyVia?: 'whatsapp' | 'sms' | 'both';
  }) => {
    const reminder: RefillReminder = {
      id: `REF-${Date.now()}`,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      medicineName: data.medicineName,
      medicineId: data.medicineId,
      dosageSchedule: data.dosageSchedule || '1 dose daily',
      intervalDays: Number(data.intervalDays || 30),
      nextRefillDate: data.nextRefillDate,
      notifyVia: data.notifyVia || 'whatsapp',
      status: 'active',
      createdAt: new Date().toISOString()
    };
    if (!store.refillReminders) store.refillReminders = [];
    store.refillReminders.unshift(reminder);
    persistStore();
    return reminder;
  },

  deleteRefillReminder: (id: string) => {
    if (!store.refillReminders) return false;
    const initialLen = store.refillReminders.length;
    store.refillReminders = store.refillReminders.filter(r => r.id !== id);
    if (store.refillReminders.length !== initialLen) {
      persistStore();
      return true;
    }
    return false;
  },

  // Coverage Locations
  getCoverageLocations: () => {
    return store.coverageLocations || INITIAL_COVERAGE_LOCATIONS;
  },

  addCoverageLocation: (location: {
    name: string;
    distance: string;
    time: string;
    freeDelivery: boolean;
    description: string;
  }) => {
    const newLoc: CoverageLocation = {
      id: `LOC-${Date.now()}`,
      name: location.name,
      distance: location.distance || '3-5 km',
      time: location.time || '20-30 mins',
      freeDelivery: location.freeDelivery !== undefined ? location.freeDelivery : true,
      description: location.description || 'Coverage via Goraya Ghat Road'
    };
    if (!store.coverageLocations) store.coverageLocations = [];
    store.coverageLocations.push(newLoc);
    persistStore();
    return newLoc;
  },

  deleteCoverageLocation: (id: string) => {
    if (!store.coverageLocations) return false;
    const initLen = store.coverageLocations.length;
    store.coverageLocations = store.coverageLocations.filter(l => l.id !== id && l.name !== id);
    if (store.coverageLocations.length !== initLen) {
      persistStore();
      return true;
    }
    return false;
  }
};
