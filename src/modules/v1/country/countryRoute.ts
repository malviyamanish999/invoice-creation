import { Router } from 'express';
import { Validator } from '../../../validate';
import countryController from './countryController';
import { CreateModel } from './countryModel';
import { AuthMiddleware } from '../auth/authMiddleware';
const authMiddleware = new AuthMiddleware();

const router: Router = Router();
const v = new Validator();

const CountryController = new countryController();

router.post('/add', authMiddleware.verifyToken, authMiddleware.checkRole, CountryController.create);

router.get('/getAll', authMiddleware.verifyToken, CountryController.getAll);

router.get('/findById/:id', authMiddleware.verifyToken, CountryController.findById);

router.put(
  '/update/:id',
  v.validate(CreateModel),
  authMiddleware.verifyToken,
  authMiddleware.checkRole,
  CountryController.Update,
);

router.delete('/delete/:id', authMiddleware.verifyToken, authMiddleware.checkRole, CountryController.Delete);

export const countryRoute: Router = router;
