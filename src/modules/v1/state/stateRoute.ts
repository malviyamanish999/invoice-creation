import { Router } from 'express';
import { Validator } from '../../../validate';
import stateController from './stateController';
import { CreateModel } from './stateModel';
import { AuthMiddleware } from '../auth/authMiddleware';
const authMiddleware = new AuthMiddleware();

const router: Router = Router();
const v = new Validator();

const StateController = new stateController();

router.post(
  '/add',
  v.validate(CreateModel),
  authMiddleware.verifyToken,
  authMiddleware.checkRole,
  StateController.create,
);

router.get('/getAll', authMiddleware.verifyToken, StateController.getAll);

router.get('/findById/:id', authMiddleware.verifyToken, StateController.findById);

router.put(
  '/update/:id',
  v.validate(CreateModel),
  authMiddleware.verifyToken,
  authMiddleware.checkRole,
  StateController.Update,
);

router.delete('/delete/:id', authMiddleware.verifyToken, authMiddleware.checkRole, StateController.Delete);

router.get('/countryWisestate', authMiddleware.verifyToken, StateController.getAllStatewiseCountry);

export const stateRoute: Router = router;
