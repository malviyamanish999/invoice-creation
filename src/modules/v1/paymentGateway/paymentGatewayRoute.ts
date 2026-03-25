import { Router } from 'express';
import { Validator } from '../../../validate';
import paymentGatewayController from './paymentGatewayController';
import { CreateModel, UpdateModel } from './paymentGatewayModel';
import { AuthMiddleware } from '../auth/authMiddleware';
const authMiddleware = new AuthMiddleware();

const router: Router = Router();
const v = new Validator();

const PaymentGatewayController = new paymentGatewayController();

router.post(
  '/add',
  v.validate(CreateModel),
  authMiddleware.verifyToken,
  authMiddleware.checkRole,
  PaymentGatewayController.create,
);

router.get('/getAll', authMiddleware.verifyToken, PaymentGatewayController.getAll);

router.get('/findById/:id', authMiddleware.verifyToken, PaymentGatewayController.findById);

router.put(
  '/update/:id',
  v.validate(UpdateModel),
  authMiddleware.verifyToken,
  authMiddleware.checkRole,
  PaymentGatewayController.Update,
);

router.delete('/delete/:id', authMiddleware.verifyToken, authMiddleware.checkRole, PaymentGatewayController.Delete);

export const paymentGatewayRoute: Router = router;
