import { Router } from 'express';
import { Validator } from '../../../validate';
import { AuthMiddleware } from './authMiddleware';
import authController from './authController';
import {
  CreateModel,
  LoginModel,
  ForgotPasswordModel,
  ChangePasswordModel,
  UpdateModel,
  ResetPasswordModel,
} from './authModel';

const router: Router = Router();
const v = new Validator();

const AuthController = new authController();
const authMiddleware = new AuthMiddleware();

router.post('/registration', v.validate(CreateModel), AuthController.register);

router.post('/login', v.validate(LoginModel), AuthController.login);

router.post('/forgotpassword', v.validate(ForgotPasswordModel), AuthController.forgotPassword);

router.post('/resetpassword', v.validate(ResetPasswordModel), AuthController.resetPassword);

router.post(
  '/changepassword',
  v.validate(ChangePasswordModel),
  authMiddleware.verifyToken,
  AuthController.changePassword,
);

router.get('/getAll', authMiddleware.verifyToken, authMiddleware.checkRole, AuthController.getAllUser);

router.get('/findById/:id', authMiddleware.verifyToken, authMiddleware.checkRole, AuthController.getByIdUser);

router.put(
  '/update/:id',
  v.validate(UpdateModel),
  authMiddleware.verifyToken,
  authMiddleware.checkRole,
  AuthController.Update,
);

router.delete('/delete/:id', authMiddleware.verifyToken, authMiddleware.checkRole, AuthController.Detele);

router.put(
  '/logout',
  v.validate(UpdateModel),
  authMiddleware.verifyToken,
  authMiddleware.checkRole,
  AuthController.logoutUser,
);

export const authRoute: Router = router;
