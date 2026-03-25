import { Router } from 'express';
import { Validator } from '../../../validate';
import paymentRecordController from './paymentRecordController';
import { CreateModel } from './paymentRecordModel';
import { AuthMiddleware } from '../auth/authMiddleware';
const authMiddleware = new AuthMiddleware();

const router: Router = Router();
const v = new Validator();

const PaymentRecordController = new paymentRecordController();

router.post(
  '/add',
  v.validate(CreateModel),
  authMiddleware.verifyToken,
  authMiddleware.checkRole,
  PaymentRecordController.create,
);

router.get('/getAll', authMiddleware.verifyToken, PaymentRecordController.getAll);

router.get('/findById/:id', authMiddleware.verifyToken, PaymentRecordController.findById);

router.put(
  '/update/:id',
  //v.validate(UpdateModel),
  authMiddleware.verifyToken,
  authMiddleware.checkRole,
  PaymentRecordController.Update,
);

router.delete('/delete/:id', authMiddleware.verifyToken, authMiddleware.checkRole, PaymentRecordController.Delete);

router.get('/getAllinvoiceCustomer', authMiddleware.verifyToken, PaymentRecordController.getAllCustomerbyPayment);

router.get('/getAllCustomerAmount', authMiddleware.verifyToken, PaymentRecordController.getAllTotalamountCustomer);

router.get(
  '/getPaymentRecord',
  authMiddleware.verifyToken,
  // v.validate(CheckEmailModel),
  PaymentRecordController.getPaymentRecordByCustomerId,
);

router.put('/updateAndLinkPayment', authMiddleware.verifyToken, PaymentRecordController.updateAndLinkPayment);

export const paymentRecordRoute: Router = router;
