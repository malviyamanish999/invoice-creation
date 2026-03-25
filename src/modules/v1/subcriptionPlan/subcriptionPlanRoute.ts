import { Router } from 'express';
import { Validator } from '../../../validate';
import subcriptionPlanController from './subcriptionPlanController';
import { CreateModel, UpdateModel } from './subcriptionPlanModel';
import { AuthMiddleware } from '../auth/authMiddleware';
const authMiddleware = new AuthMiddleware();

const router: Router = Router();
const v = new Validator();

const SubcriptionPlanController = new subcriptionPlanController();

router.post(
  '/add',
  v.validate(CreateModel),
  authMiddleware.verifyToken,
  authMiddleware.checkRole,
  SubcriptionPlanController.create,
);

router.get('/getAll', authMiddleware.verifyToken, SubcriptionPlanController.getAll);

router.get('/findById/:id', authMiddleware.verifyToken, SubcriptionPlanController.findById);

router.put(
  '/update/:id',
  v.validate(UpdateModel),
  authMiddleware.verifyToken,
  authMiddleware.checkRole,
  SubcriptionPlanController.Update,
);

router.delete('/delete/:id', authMiddleware.verifyToken, authMiddleware.checkRole, SubcriptionPlanController.Delete);

export const subcriptionPlanRoute: Router = router;
