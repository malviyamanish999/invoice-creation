import { Router } from 'express';
import { Validator } from '../../../validate';
import billSeriesController from './billseriesController';
import { CreateModel, UpdateModel } from './billseriesModel';
import { AuthMiddleware } from '../auth/authMiddleware';
const authMiddleware = new AuthMiddleware();

const router: Router = Router();
const v = new Validator();

const BillSeriesController = new billSeriesController();

router.post(
  '/add',
  v.validate(CreateModel),
  authMiddleware.verifyToken,
  authMiddleware.checkRole,
  BillSeriesController.create,
);

router.get('/getAll', authMiddleware.verifyToken, BillSeriesController.getAll);

router.get('/findById/:id', authMiddleware.verifyToken, BillSeriesController.findById);

router.put(
  '/update/:id',
  v.validate(UpdateModel),
  authMiddleware.verifyToken,
  authMiddleware.checkRole,
  BillSeriesController.Update,
);

router.delete('/delete/:id', authMiddleware.verifyToken, authMiddleware.checkRole, BillSeriesController.Delete);

export const billSeriesRoute: Router = router;
