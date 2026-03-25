import { Router } from 'express';
import { Validator } from '../../../validate';
import industryTypeController from './industryTypeController';
import { CreateModel, UpdateModel } from './industryTypeModel';
import { AuthMiddleware } from '../auth/authMiddleware';
const authMiddleware = new AuthMiddleware();

const router: Router = Router();
const v = new Validator();

const IndustryTypeController = new industryTypeController();

router.post(
  '/add',
  v.validate(CreateModel),
  authMiddleware.verifyToken,
  authMiddleware.checkRole,
  IndustryTypeController.create,
);

router.get('/getAll', authMiddleware.verifyToken, IndustryTypeController.getAll);

router.get('/findById/:id', authMiddleware.verifyToken, IndustryTypeController.findById);

router.put(
  '/update/:id',
  v.validate(UpdateModel),
  authMiddleware.verifyToken,
  authMiddleware.checkRole,
  IndustryTypeController.Update,
);

router.delete('/delete/:id', authMiddleware.verifyToken, authMiddleware.checkRole, IndustryTypeController.Delete);

export const industryTypeRoute: Router = router;
