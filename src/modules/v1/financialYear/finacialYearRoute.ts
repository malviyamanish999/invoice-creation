import { Router } from 'express';
import { Validator } from '../../../validate';
import financialYearController from './financialYearController';
import { CreateModel, UpdateModel } from './finacialYearModel';
import { AuthMiddleware } from '../auth/authMiddleware';
const authMiddleware = new AuthMiddleware();

const router: Router = Router();
const v = new Validator();

const FinancialYearController = new financialYearController();

router.post(
  '/add',
  v.validate(CreateModel),
  authMiddleware.verifyToken,
  authMiddleware.checkRole,
  FinancialYearController.create,
);

router.get('/getAll', authMiddleware.verifyToken, FinancialYearController.getAll);

router.get('/findById/:id', authMiddleware.verifyToken, FinancialYearController.findById);

router.put(
  '/update/:id',
  v.validate(UpdateModel),
  authMiddleware.verifyToken,
  authMiddleware.checkRole,
  FinancialYearController.Update,
);

router.delete('/delete/:id', authMiddleware.verifyToken, authMiddleware.checkRole, FinancialYearController.Delete);

export const financialYearRoute: Router = router;
