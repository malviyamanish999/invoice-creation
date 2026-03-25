import { Jwt } from '../../../helpers/jwt';
import * as _ from 'lodash';
import { NextFunction, Response } from 'express';
import * as bcrypt from 'bcrypt';
import { Constants } from '../../../../config/constants';
import i18next from 'i18next';
import db from '../../../database/db';
import ResponseBuilder from '../../../helpers/responseBuilder';
const User = db.user;

export class AuthMiddleware {
  public async verifyToken(req: any, res: Response, next: NextFunction) {
    try {
      const authorizationHeader = req.headers.authorization;
      const taskopadAuthorizationHeader = req.headers[Constants.TASKOPAD_AUTHORIZATION];
      if (!authorizationHeader || _.isEmpty(authorizationHeader)) {
        return res
          .status(Constants.UNAUTHORIZED_CODE)
          .json(ResponseBuilder.errorMessage({}, i18next.t('UNAUTHORIZED'), Constants.UNAUTHORIZED_CODE));
      }

      const token = authorizationHeader.split(' ')[1];
      const tokenInfo: any = Jwt.decodeAuthToken(token);
      req.authUser = tokenInfo;

      if (taskopadAuthorizationHeader) {
        // Static taskopad-token flow
        const isTokenMatch = token === (process.env.TASKOPAD_AUTH_TOKEN as string) ? true : false;
        const hashSecretKey = await bcrypt.hash(taskopadAuthorizationHeader, 10);
        const isSecretMatch = await bcrypt.compare(process.env?.TASKOPAD_SECRET_KEY as string, hashSecretKey);

        if (isTokenMatch && isSecretMatch) {
          return next();
        }
      } else if (tokenInfo?.email) {
        const user = await User.findOne({ where: { email: tokenInfo.email } });

        if (user) {
          req._user = user;
          return next();
        }
      }
      return res
        .status(Constants.UNAUTHORIZED_CODE)
        .json(ResponseBuilder.errorMessage({}, i18next.t('UNAUTHORIZED'), Constants.UNAUTHORIZED_CODE));
    } catch (error) {
      return res.status(Constants.INTERNAL_SERVER_ERROR_CODE).send({
        responseCode: Constants.INTERNAL_SERVER_ERROR_CODE,
        responseMessage: i18next.t('ERR_INTERNAL_SERVER'),
      });
    }
  }

  public async checkRole(req: any, res: Response, next: NextFunction) {
    try {
      const result = await User.findByPk(req.authUser.id);
      if (result.role !== `manager`) {
        res.status(Constants.FAIL_CODE).send({
          responseCode: Constants.FAIL_CODE,
          responseMessage: i18next.t('NOT_MANAGER'),
        });
      } else {
        next();
      }
    } catch (error) {
      res.status(Constants.INTERNAL_SERVER_ERROR_CODE).send({
        responseCode: Constants.INTERNAL_SERVER_ERROR_CODE,
        responseMessage: i18next.t('ERR_INTERNAL_SERVER'),
      });
    }
  }
}
