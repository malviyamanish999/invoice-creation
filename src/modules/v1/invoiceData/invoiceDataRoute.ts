import { Router } from 'express';
import { Validator } from '../../../validate';
import invoiceDataController from './invoiceDataController';
import { CreateModel, UpdateModel } from './invoiceDataModel';
import { AuthMiddleware } from '../auth/authMiddleware';
const authMiddleware = new AuthMiddleware();

const router: Router = Router();
const v = new Validator();

const InvoiceDataController = new invoiceDataController();

router.post('/create', v.validate(CreateModel), authMiddleware.verifyToken, InvoiceDataController.create);

router.get(
  '/getAll',
  authMiddleware.verifyToken,
  // authMiddleware.checkRole,
  InvoiceDataController.getAll,
);

router.get('/findById/:id', authMiddleware.verifyToken, InvoiceDataController.findById);

router.put(
  '/update/:id',
  v.validate(UpdateModel),
  authMiddleware.verifyToken,
  authMiddleware.checkRole,
  InvoiceDataController.Update,
);

router.delete('/delete/:id', authMiddleware.verifyToken, authMiddleware.checkRole, InvoiceDataController.Delete);

router.get('/PDF/:id', authMiddleware.verifyToken, InvoiceDataController.convertPDF);

router.get('/send_pdf/:id', authMiddleware.verifyToken, InvoiceDataController.pdfSendEmail);

router.get('/findCustomerInvoice', authMiddleware.verifyToken, InvoiceDataController.findCustomerInvoice);

export const invoiceDataRoute: Router = router;
