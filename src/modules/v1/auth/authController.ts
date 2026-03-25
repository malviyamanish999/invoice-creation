import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';
import db from '../../../database/db';
import { Constants } from '../../../../config/constants';
import ResponseBuilder from '../../../helpers/responseBuilder';
import authUtils from '../auth/authUtils';
import { Jwt } from '../../../helpers/jwt';
dotenv.config();

const User = db.user;
const AuthUtils = new authUtils();
export class AuthController {
  public register = async (req: Request, res: Response) => {
    try {
      const applicationData = req.body;
      const userCreate = await AuthUtils.createUser({ ...applicationData });
      if (userCreate?.message) {
        return res.status(userCreate.statusCode).json(ResponseBuilder.badRequest(req.t(userCreate?.message)));
      }
      const response = {
        statusCode: Constants.SUCCESS_CODE,
        message: req.t('USER_REGISTER'),
      };
      return res.status(200).json(response);
    } catch (error) {
      return res.json({
        statusCode: Constants.INTERNAL_SERVER_ERROR_CODE,
        error: error,
        message: req.t('ERR_INTERNAL_SERVER'),
      });
    }
  };

  public login = async (req: Request, res: Response) => {
    try {
      const applicationData = req.body;
      const result: any = await User.findOne({
        where: { email: applicationData.email?.toLowerCase() },
      });
      if (result !== null) {
        const isMatch = await bcrypt.compare(applicationData.password, result.password);
        if (result.email === applicationData.email && isMatch) {
          const data = {
            id: result.id,
            email: result.email,
            first_name: result.first_name,
            last_name: result.last_name,
          };
          const token = Jwt.getAuthToken(data, process.env?.JWT_EXPIRY_TIME);
          await User.update({ token: token }, { where: { id: result.id } });
          const userData: any = await User.findOne({
            where: { email: applicationData.email },
            attributes: Constants.TABLE_ATTRIBUTES.USER_ATTRIBUTES,
          });
          return res
            .status(200)
            .cookie('AuthToken', token)
            .set('AuthToken', token)
            .json({
              Data: {
                UserDetails: userData,
              },
              statusCode: Constants.SUCCESS_CODE,
              message: req.t('LOGIN_SUCCESS'),
            });
        } else if (isMatch === false) {
          const response = {
            statusCode: Constants.FAIL_CODE,
            message: req.t('PASSWORD_INVALID'),
          };
          return res.status(Constants.FAIL_CODE).json(response);
        }
      } else {
        const notRegister = {
          statusCode: Constants.FAIL_CODE,
          message: req.t('NOT_REGISTERDUSER'),
        };
        return res.status(Constants.FAIL_CODE).json(notRegister);
      }
    } catch (error) {
      return res.send({
        statusCode: Constants.INTERNAL_SERVER_ERROR_CODE,
        error: error,
        message: req.t('ERR_INTERNAL_SERVER'),
      });
    }
  };

  public forgotPassword = async (req: Request, res: Response) => {
    try {
      const email = req.body.email;
      const result = await User.findOne({ where: { email: email } });
      if (result) {
        await AuthUtils.forgotPassword(email);
        return res.send({
          statusCode: Constants.SUCCESS_CODE,
          email: email,
          message: req.t('FORGOT_PASSWORD'),
        });
      } else {
        return res.status(Constants.FAIL_CODE).send({
          statusCode: Constants.FAIL_CODE,
          message: req.t('VALID_EMAIL'),
        });
      }
    } catch (error) {
      return res.status(500).send({
        error: error,
        message: req.t('ERR_INTERNAL_SERVER'),
      });
    }
  };

  public resetPassword = async (req: any, res: Response) => {
    const token = req.query.token;
    const { newpassword, password_confirmation } = req.body;
    const result = await AuthUtils.resetPassword(token, newpassword, password_confirmation);
    if (result?.message) {
      return res.status(result.statusCode).json(ResponseBuilder.badRequest(req.t(result?.message)));
      // }
      // if (result.code === Constants.FAIL_CODE) {
      //   return res.send({
      //     statusCode: Constants.FAIL_CODE,
      //     message: req.t('VALID_DATA'),
      //   });
    } else {
      return res.status(Constants.FAIL_CODE).send({
        statusCode: Constants.SUCCESS_CODE,
        message: req.t('RESET_PASSWORD'),
      });
    }
  };

  public changePassword = async (req: any, res: Response) => {
    const { newpassword, password_confirmation } = req.body;
    const result: any = await User.findOne({
      where: { id: req.authUser.id },
    });

    if (result) {
      const isMatch = await bcrypt.compare(req.body.password, result.password);
      if (isMatch) {
        if (newpassword && password_confirmation) {
          if (newpassword !== password_confirmation) {
            const responseData = {
              statusCode: Constants.FAIL_CODE,
              message: req.t('NEW_PASSWORD_NOT_MATCH'),
            };
            return res.status(Constants.FAIL_CODE).json(responseData);
          }
          const salt = await bcrypt.genSalt(10);
          const newHashPassword = await bcrypt.hash(newpassword, salt);
          await User.update({ password: newHashPassword }, { where: { id: req.authUser.id } });
          const response = {
            statusCode: Constants.SUCCESS_CODE,
            message: req.t('PASSWORD_CHANGE_SUCCESS'),
          };
          return res.json(response);
        }
      } else {
        const response = {
          statusCode: Constants.FAIL_CODE,
          message: req.t('PASSWORD_VALID'),
        };
        return res.status(Constants.FAIL_CODE).json(response);
      }
    } else {
      return res.status(Constants.FAIL_CODE).send({
        statusCode: Constants.FAIL_CODE,
        message: req.t('NOT_REGISTERDUSER'),
      });
    }
    return res.status(Constants.FAIL_CODE).json({
      statusCode: Constants.FAIL_CODE,
      message: req.t('PASSWORD_INVALID'),
    });
  };

  public getAllUser = async (req: Request, res: Response) => {
    try {
      const result = await AuthUtils.getAll(req?.query);
      if (result) {
        return res.status(200).json(ResponseBuilder.data(result, req.t('GET_ALL')));
      } else {
        return res.status(Constants.FAIL_CODE).json(ResponseBuilder.badRequest(req.t('NOT_FOUND')));
      }
    } catch (error: any) {
      return res.status(500).send({
        error: error,
        message: req.t('ERR_INTERNAL_SERVER'),
      });
    }
  };

  public getByIdUser = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const result = await AuthUtils.getByID(id);
      if (result?.message) {
        return res.status(result.statusCode).json(ResponseBuilder.badRequest(req.t(result?.message)));
      }
      return res.status(200).json(ResponseBuilder.data(result, req.t('GET_ALL')));
    } catch (error) {
      return res.status(500).send({
        error: error,
        message: req.t('ERR_INTERNAL_SERVER'),
      });
    }
  };

  public Update = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const result = await AuthUtils.getByID(id);
      if (result?.message) {
        return res.status(result.statusCode).json(ResponseBuilder.badRequest(req.t(result?.message)));
      }
      if (result) {
        const applicationData = req.body;
        const update = await AuthUtils.userUpdate(id, applicationData);
        return res.status(200).json(ResponseBuilder.data(update, req.t('DATA_UPDATE')));
      } else {
        return res.status(Constants.FAIL_CODE).json(ResponseBuilder.badRequest(req.t('NOT_REGISTERDUSER')));
      }
    } catch (error) {
      return res.status(500).send({
        error: error,
        message: req.t('ERR_INTERNAL_SERVER'),
      });
    }
  };

  public Detele = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const result = await AuthUtils.userDelete(id);
      if (result?.message) {
        return res.status(result.statusCode).json(ResponseBuilder.badRequest(req.t(result?.message)));
      }
      return res.status(200).json(ResponseBuilder.data(result, req.t('USER_DELETE')));
    } catch (error) {
      return res.status(500).send({
        error: error,
        message: req.t('ERR_INTERNAL_SERVER'),
      });
    }
  };

  public logoutUser = async (req: any, res: Response) => {
    try {
      const id = req.authUser.id;
      const result = await AuthUtils.userLogout(id);
      if (result) {
        return res.status(200).json(ResponseBuilder.data(result, req.t('GET_ALL')));
      } else {
        return res.status(Constants.FAIL_CODE).json(ResponseBuilder.badRequest(req.t('NOT_FOUND')));
      }
    } catch (error: any) {
      return res.status(500).send({
        error: error,
        message: req.t('ERR_INTERNAL_SERVER'),
      });
    }
  };
}

export default AuthController;
