import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db } from './server/db.js';
import { analyzePrescription, chatWithPharmacist, getSeasonalHealthTips } from './server/ai.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Middleware for JSON parsing with large payload support for prescription image uploads
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // --- API Routes ---

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      store: 'Ishwar Pharmacy and Pharma Clinic',
      location: 'Pachrukhiya Kanchanpur UP',
      timestamp: new Date().toISOString()
    });
  });

  // Medicines API
  app.get('/api/medicines', (req: Request, res: Response) => {
    try {
      const { search, category } = req.query;
      const medicines = db.getMedicines(
        typeof search === 'string' ? search : undefined,
        typeof category === 'string' ? category : undefined
      );
      res.json(medicines);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch medicines' });
    }
  });

  app.get('/api/medicines/:id', (req: Request, res: Response) => {
    try {
      const medicine = db.getMedicineById(req.params.id);
      if (!medicine) {
        return res.status(404).json({ error: 'Medicine not found' });
      }
      res.json(medicine);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch medicine' });
    }
  });

  app.post('/api/medicines', (req: Request, res: Response) => {
    try {
      const {
        name,
        genericName,
        category,
        price,
        mrp,
        stock,
        minThreshold,
        dosageForm,
        manufacturer,
        batchNumber,
        expiryDate,
        requiresPrescription,
        rackLocation,
        description,
        usageInstructions,
        composition
      } = req.body;

      if (!name || price === undefined || stock === undefined) {
        return res.status(400).json({ error: 'Name, price and stock are required' });
      }

      const newMedicine = db.addMedicine({
        name,
        genericName: genericName || name,
        category: category || 'General Healthcare',
        price: Number(price),
        mrp: Number(mrp || price),
        stock: Number(stock),
        minThreshold: Number(minThreshold || 10),
        dosageForm: dosageForm || 'Unit',
        manufacturer: manufacturer || 'Standard Pharma',
        batchNumber: batchNumber || `BATCH-${Date.now().toString().slice(-4)}`,
        expiryDate: expiryDate || '2027-12',
        requiresPrescription: Boolean(requiresPrescription),
        rackLocation: rackLocation || 'Counter A',
        description: description || '',
        usageInstructions: usageInstructions || 'As directed by physician',
        composition: composition || genericName || name,
        frontImage: req.body.frontImage || undefined,
        backImage: req.body.backImage || undefined
      });

      res.status(201).json(newMedicine);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to add medicine' });
    }
  });

  app.put('/api/medicines/:id', (req: Request, res: Response) => {
    try {
      const updated = db.updateMedicine(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Medicine not found' });
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update medicine' });
    }
  });

  app.delete('/api/medicines/:id', (req: Request, res: Response) => {
    try {
      const deleted = db.deleteMedicine(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Medicine not found' });
      }
      res.json({ success: true, message: 'Medicine removed successfully' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to delete medicine' });
    }
  });

  // Orders API
  app.get('/api/orders', (req: Request, res: Response) => {
    try {
      const phone = typeof req.query.phone === 'string' ? req.query.phone : undefined;
      let orders = db.getOrders();
      if (phone) {
        const clean = phone.replace(/\D/g, '');
        orders = orders.filter(o => o.customerPhone.replace(/\D/g, '').includes(clean));
      }
      res.json(orders);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch orders' });
    }
  });

  // Track Order endpoint (by order number, ID, or phone) - MUST BE BEFORE /api/orders/:id
  app.get('/api/orders/track', (req: Request, res: Response) => {
    try {
      const q = typeof req.query.q === 'string' ? req.query.q : '';
      const results = db.trackOrder(q);
      res.json(results);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Tracking lookup failed' });
    }
  });

  app.get('/api/orders/:id', (req: Request, res: Response) => {
    try {
      const order = db.getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json(order);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch order' });
    }
  });

  app.post('/api/orders', (req: Request, res: Response) => {
    try {
      const {
        customerName,
        customerPhone,
        deliveryType,
        village,
        address,
        landmark,
        notes,
        items,
        paymentMethod,
        prescriptionAttached
      } = req.body;

      if (!customerName || !customerPhone || !items || !items.length) {
        return res.status(400).json({ error: 'Customer name, phone, and items are required' });
      }

      const order = db.createOrder({
        customerName,
        customerPhone,
        deliveryType: deliveryType || 'home_delivery',
        village: village || 'Pachrukhiya',
        address: address || 'Pachrukhiya, Goraya Ghat Road',
        landmark,
        notes,
        items,
        paymentMethod: paymentMethod || 'cash_on_delivery',
        prescriptionAttached
      });

      res.status(201).json(order);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to place order' });
    }
  });

  app.patch('/api/orders/:id/status', (req: Request, res: Response) => {
    try {
      const { status, riderName, riderPhone, estimatedDelivery } = req.body;
      if (!['pending', 'packed', 'out_for_delivery', 'delivered', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Invalid order status' });
      }
      const updated = db.updateOrderStatus(req.params.id, status, {
        riderName,
        riderPhone,
        estimatedDelivery
      });
      if (!updated) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update order status' });
    }
  });

  // Appointments API
  app.get('/api/appointments', (_req: Request, res: Response) => {
    try {
      const appointments = db.getAppointments();
      res.json(appointments);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch appointments' });
    }
  });

  app.post('/api/appointments', (req: Request, res: Response) => {
    try {
      const {
        patientName,
        patientAge,
        patientGender,
        patientPhone,
        village,
        serviceType,
        appointmentDate,
        timeSlot,
        symptoms
      } = req.body;

      if (!patientName || !patientPhone || !serviceType || !appointmentDate || !timeSlot) {
        return res.status(400).json({ error: 'Name, phone, service, date, and slot are required' });
      }

      const appointment = db.createAppointment({
        patientName,
        patientAge: Number(patientAge || 30),
        patientGender: patientGender || 'Male',
        patientPhone,
        village: village || 'Pachrukhiya',
        serviceType,
        appointmentDate,
        timeSlot,
        symptoms
      });

      res.status(201).json(appointment);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to book appointment' });
    }
  });

  app.patch('/api/appointments/:id/status', (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      if (!['confirmed', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Invalid appointment status' });
      }
      const updated = db.updateAppointmentStatus(req.params.id, status);
      if (!updated) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update appointment' });
    }
  });

  // Inquiries & Feedback API
  app.get('/api/inquiries', (_req: Request, res: Response) => {
    try {
      const inquiries = db.getInquiries();
      res.json(inquiries);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch inquiries' });
    }
  });

  app.post('/api/inquiries', (req: Request, res: Response) => {
    try {
      const { name, phone, email, village, subject, message, type } = req.body;
      if (!name || !phone || !message) {
        return res.status(400).json({ error: 'Name, phone and message are required' });
      }

      const inquiry = db.createInquiry({
        name,
        phone,
        email,
        village: village || 'Pachrukhiya',
        subject: subject || 'General Inquiry',
        message,
        type: type || 'inquiry'
      });

      res.status(201).json(inquiry);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to submit inquiry' });
    }
  });

  // Reports & Analytics API
  app.get('/api/reports', (_req: Request, res: Response) => {
    try {
      const reports = db.getReports();
      res.json(reports);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to generate reports' });
    }
  });

  // Retail Counter Billing (POS) API
  app.get('/api/invoices', (_req: Request, res: Response) => {
    try {
      const invoices = db.getInvoices();
      res.json(invoices);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch invoices' });
    }
  });

  app.post('/api/invoices', (req: Request, res: Response) => {
    try {
      const {
        customerName,
        customerPhone,
        doctorName,
        village,
        manualAddress,
        paymentMode,
        items,
        discount,
        gstPercent,
        notes
      } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'At least one medicine item is required for billing.' });
      }

      const invoice = db.createInvoice({
        customerName,
        customerPhone,
        doctorName,
        village,
        manualAddress,
        paymentMode,
        items,
        discount: Number(discount || 0),
        gstPercent: Number(gstPercent || 0),
        notes
      });

      res.status(201).json(invoice);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to generate billing invoice' });
    }
  });

  // Invoice Return / Refund
  app.post('/api/invoices/:id/return', (req: Request, res: Response) => {
    try {
      const { medicineId, quantity, unitType, reason } = req.body;
      if (!medicineId || !quantity) {
        return res.status(400).json({ error: 'medicineId and quantity are required' });
      }
      const updatedInvoice = db.returnInvoiceItem(req.params.id, {
        medicineId,
        quantity: Number(quantity),
        unitType: unitType || 'strip',
        reason: reason || 'Customer Return'
      });
      res.json(updatedInvoice);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to process return' });
    }
  });

  // Expiry Dashboard
  app.get('/api/inventory/expiry', (_req: Request, res: Response) => {
    try {
      const report = db.getExpiryReport();
      res.json(report);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch expiry report' });
    }
  });

  // Refill Reminders API
  app.get('/api/refill-reminders', (_req: Request, res: Response) => {
    try {
      const reminders = db.getRefillReminders();
      res.json(reminders);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch refill reminders' });
    }
  });

  app.post('/api/refill-reminders', (req: Request, res: Response) => {
    try {
      const { customerName, customerPhone, medicineName, medicineId, dosageSchedule, intervalDays, nextRefillDate, notifyVia } = req.body;
      if (!customerName || !customerPhone || !medicineName || !nextRefillDate) {
        return res.status(400).json({ error: 'Name, phone, medicine and date are required' });
      }
      const reminder = db.createRefillReminder({
        customerName,
        customerPhone,
        medicineName,
        medicineId,
        dosageSchedule,
        intervalDays: Number(intervalDays || 30),
        nextRefillDate,
        notifyVia
      });
      res.status(201).json(reminder);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to create refill reminder' });
    }
  });

  app.delete('/api/refill-reminders/:id', (req: Request, res: Response) => {
    try {
      const success = db.deleteRefillReminder(req.params.id);
      res.json({ success });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to delete refill reminder' });
    }
  });

  // Coverage Locations API
  app.get('/api/coverage-locations', (_req: Request, res: Response) => {
    try {
      const locations = db.getCoverageLocations();
      res.json(locations);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch coverage locations' });
    }
  });

  app.post('/api/coverage-locations', (req: Request, res: Response) => {
    try {
      const { name, distance, time, freeDelivery, description } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Location name is required' });
      }
      const loc = db.addCoverageLocation({
        name,
        distance: distance || '3 km',
        time: time || '20 mins',
        freeDelivery: freeDelivery !== undefined ? Boolean(freeDelivery) : true,
        description: description || 'Village delivery route'
      });
      res.status(201).json(loc);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to add coverage location' });
    }
  });

  app.delete('/api/coverage-locations/:id', (req: Request, res: Response) => {
    try {
      const success = db.deleteCoverageLocation(req.params.id);
      res.json({ success });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to delete location' });
    }
  });

  // AI Seasonal Health Tips API
  app.get('/api/ai/seasonal-health-tips', async (_req: Request, res: Response) => {
    try {
      const tips = await getSeasonalHealthTips();
      res.json(tips);
    } catch (err: any) {
      console.error('Seasonal health tips error:', err);
      res.status(500).json({ error: 'Failed to retrieve seasonal health tips' });
    }
  });

  // AI Prescription Scanner API
  app.post('/api/ai/analyze-prescription', async (req: Request, res: Response) => {
    try {
      const { imageBase64, mimeType } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: 'imageBase64 is required' });
      }

      const result = await analyzePrescription(imageBase64, mimeType || 'image/jpeg');
      res.json(result);
    } catch (err: any) {
      console.error('Prescription analysis error:', err);
      res.status(500).json({
        error: 'Failed to analyze prescription',
        details: err?.message || 'Server error'
      });
    }
  });

  // AI Pharmacist Multi-turn Chat API
  app.post('/api/ai/chat', async (req: Request, res: Response) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Messages array is required' });
      }

      const reply = await chatWithPharmacist(messages);
      res.json({ reply });
    } catch (err: any) {
      console.error('Chat error:', err);
      res.status(500).json({
        error: 'Failed to communicate with AI Pharmacist',
        details: err?.message || 'Server error'
      });
    }
  });

  // Setup Vite or Static File Serving
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Ishwar Pharmacy Server listening on http://0.0.0.0:${PORT}`);
  });
}

createServer().catch((err) => {
  console.error('Failed to start server:', err);
});
