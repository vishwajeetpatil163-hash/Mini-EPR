import { Router, Response } from 'express';
import { db, CustomerStatus, CustomerType } from '../db/database';
import { authenticateJWT, requireRoles, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// All customer routes require JWT authentication
router.use(authenticateJWT);

// GET /api/customers
router.get('/', (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const q = (req.query.q as string) || '';
    const status = (req.query.status as string) || '';
    const type = (req.query.type as string) || '';

    const result = db.getCustomers({ page, limit, q, status, type });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/customers/:id
router.get('/:id', (req, res, next) => {
  try {
    const customer = db.getCustomerById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'NotFound', message: `Customer with ID '${req.params.id}' not found.` });
    }
    const followUpNotes = db.getFollowUpNotes(customer.id);
    res.json({ ...customer, followUpNotes });
  } catch (err) {
    next(err);
  }
});

// POST /api/customers
router.post('/', requireRoles(['ADMIN', 'SALES', 'ACCOUNTS', 'WAREHOUSE']), (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { name, mobile, email, businessName, gstNumber, customerType, address, status, followUpDate, notes } = req.body;

    if (!name || !mobile || !email || !businessName || !address) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Name, mobile, email, business name, and address are required.',
      });
    }

    const newCustomer = db.createCustomer({
      name: name.trim(),
      mobile: mobile.trim(),
      email: email.trim(),
      businessName: businessName.trim(),
      gstNumber: gstNumber ? gstNumber.trim() : '',
      customerType: (customerType as CustomerType) || 'WHOLESALE',
      address: address.trim(),
      status: (status as CustomerStatus) || 'ACTIVE',
      followUpDate: followUpDate || '',
      notes: notes || '',
    });

    res.status(201).json({
      message: 'Customer created successfully.',
      customer: newCustomer,
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/customers/:id
router.put('/:id', requireRoles(['ADMIN', 'SALES', 'ACCOUNTS', 'WAREHOUSE']), (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const updated = db.updateCustomer(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'NotFound', message: `Customer with ID '${req.params.id}' not found.` });
    }
    res.json({ message: 'Customer updated successfully.', customer: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/customers/:id
router.delete('/:id', requireRoles(['ADMIN']), (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const success = db.deleteCustomer(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'NotFound', message: `Customer with ID '${req.params.id}' not found.` });
    }
    res.json({ message: 'Customer deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

// GET /api/customers/:id/followups
router.get('/:id/followups', (req, res, next) => {
  try {
    const notes = db.getFollowUpNotes(req.params.id);
    res.json({ customerId: req.params.id, notes });
  } catch (err) {
    next(err);
  }
});

// POST /api/customers/:id/followups
router.post('/:id/followups', requireRoles(['ADMIN', 'SALES']), (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { note } = req.body;
    if (!note || typeof note !== 'string' || !note.trim()) {
      return res.status(400).json({ error: 'ValidationError', message: 'Note content is required.' });
    }

    const createdBy = req.user?.name || 'Staff User';
    const followUp = db.addFollowUpNote(req.params.id, note.trim(), createdBy);

    res.status(201).json({ message: 'Follow-up note added successfully.', note: followUp });
  } catch (err) {
    next(err);
  }
});

export default router;
