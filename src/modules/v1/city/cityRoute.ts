import { Router } from 'express';
import { Validator } from '../../../validate';
import cityController from './cityController';
import { CreateModel } from './cityModel';
import { AuthMiddleware } from '../auth/authMiddleware';
const authMiddleware = new AuthMiddleware();

const router: Router = Router();
const v = new Validator();

const CityController = new cityController();

router.post(
  '/add',
  v.validate(CreateModel),
  authMiddleware.verifyToken,
  authMiddleware.checkRole,
  CityController.create,
);

router.get('/getAll', authMiddleware.verifyToken, CityController.getAll);

router.get('/findById/:id', authMiddleware.verifyToken, CityController.findById);

router.put(
  '/update/:id',
  v.validate(CreateModel),
  authMiddleware.verifyToken,
  authMiddleware.checkRole,
  CityController.Update,
);

router.delete('/delete/:id', authMiddleware.verifyToken, authMiddleware.checkRole, CityController.Delete);

router.get('/getAllCities', authMiddleware.verifyToken, CityController.getAllCities);

export const cityRoute: Router = router;
