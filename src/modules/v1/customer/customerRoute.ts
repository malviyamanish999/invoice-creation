import { Router } from 'express';
import { Validator } from '../../../validate';
import customerController from './customerController';
import { CreateModel, UpdateModel } from './customerModel';
import { AuthMiddleware } from '../auth/authMiddleware';
const authMiddleware = new AuthMiddleware();

const router: Router = Router();
const v = new Validator();

const CustomerController = new customerController();

router.post('/registration', v.validate(CreateModel), authMiddleware.verifyToken, CustomerController.create);

router.get('/getAll', authMiddleware.verifyToken, CustomerController.getAll);

router.get('/findById/:id', authMiddleware.verifyToken, CustomerController.findById);

router.put(
  '/update/:id',
  v.validate(UpdateModel),
  authMiddleware.verifyToken,
  authMiddleware.checkRole,
  CustomerController.Update,
);

router.put(
  '/gstFileUpload/:id',
  authMiddleware.verifyToken,
  authMiddleware.checkRole,
  CustomerController.gstFileUpdate,
);

router.delete('/delete/:id', authMiddleware.verifyToken, authMiddleware.checkRole, CustomerController.Delete);

router.get('/getCustomerDetails', authMiddleware.verifyToken, CustomerController.getCustomerDetails);

router.post(
  '/updateCustomerDetails',
  authMiddleware.verifyToken,
  authMiddleware.checkRole,
  CustomerController.updateCustomerDetails,
);

router.get('/getLogDetails', authMiddleware.verifyToken, CustomerController.getLogDetails);

export const customerRoute: Router = router;
