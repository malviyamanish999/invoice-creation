import { Router } from 'express';
import { Validator } from '../../../validate';
import descriptionController from './descriptionController';
import { CreateModel, UpdateModel } from './descriptionModel';
import { AuthMiddleware } from '../auth/authMiddleware';
const authMiddleware = new AuthMiddleware();

const router: Router = Router();
const v = new Validator();

const DescriptionController = new descriptionController();

router.post(
  '/add',
  v.validate(CreateModel),
  authMiddleware.verifyToken,
  authMiddleware.checkRole,
  DescriptionController.create,
);

router.get('/getAll', authMiddleware.verifyToken, DescriptionController.getAll);

router.get('/findById/:id', authMiddleware.verifyToken, DescriptionController.findById);

router.put(
  '/update/:id',
  v.validate(UpdateModel),
  authMiddleware.verifyToken,
  authMiddleware.checkRole,
  DescriptionController.Update,
);

router.delete('/delete/:id', authMiddleware.verifyToken, authMiddleware.checkRole, DescriptionController.Delete);

export const descriptionRoute: Router = router;
