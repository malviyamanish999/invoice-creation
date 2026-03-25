import * as dotenv from 'dotenv';
import sendEmail from '../../../helpers/sendEmail';
import db from '../../../database/db';
import ResponseBuilder from '../../../helpers/responseBuilder';
import i18next from 'i18next';
import { Constants } from '../../../../config/constants';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import path from 'path';
import ejs from 'ejs';
import { Jwt } from '../../../helpers/jwt';
import { Op } from 'sequelize';

dotenv.config();

const User = db.user;
const sendMail = new sendEmail();

class AuthUtils {
  public createUser = async (insertData: any) => {
    try {
      const hashPass = await bcrypt.hash(insertData.password, 10);
      const data = {
        email: insertData.email,
        first_name: insertData.first_name,
        last_name: insertData.last_name,
        password: hashPass,
        // empId: insertData.empId,
        // designation: insertData.designation,
      };
      // find user already exist
      const oldUsertt = await User.findAll({
        where: { email: data.email },
        paranoid: true,
      });
      if (oldUsertt[0]) {
        return {
          statusCode: Constants.FAIL_CODE,
          message: i18next.t('UNIQ_EMAIL'),
        };
      }
      // Create new User
      const addUsers = await User.create(data);
      return ResponseBuilder.data(i18next.t(addUsers, 'DATA_INSERT'));
    } catch (error: any) {
      return ResponseBuilder.errorMessage(error, i18next.t('ERR_INTERNAL_SERVER'));
    }
  };

  public loginUser = async (insertData: any) => {
    try {
      const result: any = await User.findOne({
        where: { email: insertData.email },
      });
      if (result != null) {
        const isMatch = await bcrypt.compare(insertData.password, result.password);
        if (result.email === insertData.email && isMatch) {
          const data = {
            id: result.id,
            email: result.email,
            first_name: result.first_name,
            last_name: result.last_name,
          };
          const token = jwt.sign(data, process.env.JWT_SECRET_KEY as string);
          await User.update({ token: token }, { where: { id: result.id } });
          return {
            statusCode: Constants.SUCCESS_CODE,
            message: i18next.t(token),
          };
        } else if (isMatch === false) {
          return {
            statusCode: Constants.FAIL_CODE,
            message: i18next.t('PASSWORD_INVALID'),
          };
        }
      } else {
        return {
          statusCode: Constants.FAIL_CODE,
          message: i18next.t('NOT_REGISTERDUSER'),
        };
      }
    } catch (error) {
      return ResponseBuilder.errorMessage(error, i18next.t('ERR_INTERNAL_SERVER'));
    }
  };

  public forgotPassword = async (email: string) => {
    // if you want to send mail through gmail then uncomment below line
    const transport = await sendMail.sendMailSmtp();
    // if you want to send mail through Mailtrap then uncomment below line
    const result = await User.findOne({ where: { email: email } });
    const name = result.first_name + ' ' + result.last_name;
    if (result) {
      const data = {
        userID: result.id,
        name: name,
      };
      const token = Jwt.getAuthToken(data, process.env?.JWT_FORGOT_PASSWORD_EXPIRY_TIME);
      const link = `https://invoice.taskopad.com/auth/reset-password?token=${token}`;
      await User.update({ token: token }, { where: { email: email } });
      const pathDir = path.resolve(__dirname, '../../../templates/email.ejs');
      ejs.renderFile(pathDir, { name: name, link: link }, function (err, newata) {
        if (err) {
          return err;
        } else {
          const mailOptions = {
            from: process.env.From,
            to: email,
            subject: `Reset Password`,
            html: newata,
          };
          transport.sendMail(mailOptions, function (error: any, info: { response: string }) {
            if (error) {
              return error;
            } else {
              return 'Email sent successfully: ' + info.response;
            }
          });
        }
      });
    } else {
      return {
        statusCode: Constants.FAIL_CODE,
        message: i18next.t('VALID_EMAIL'),
      };
    }
  };

  public resetPassword = async (token: any, newpassword: any, password_confirmation: any) => {
    if (newpassword && password_confirmation) {
      if (newpassword !== password_confirmation) {
        return {
          statusCode: Constants.FAIL_CODE,
          message: i18next.t('NEW_PASSWORD_NOT_MATCH'),
        };
      }
      const salt = await bcrypt.genSalt(10);
      const newHashPassword = await bcrypt.hash(newpassword, salt);
      return User.update({ password: newHashPassword }, { where: { token } });
    } else {
      return {
        statusCode: Constants.FAIL_CODE,
        message: i18next.t('NEW_PASSWORD_AND_CONFIRMPS'),
      };
    }
  };

  public getAll = async (reqQuery: any) => {
    try {
      const { searchBy, searchValue } = reqQuery;
      let where = {};

      if (searchBy && searchValue) {
        where = {
          [searchBy]: {
            [Op.startsWith]: searchValue,
          },
        };
      }
      const result = await User.findAll({
        order: [['id', 'ASC']], // Sort by id in ascending order
        where,
      });
      if (result) {
        return result;
      } else {
        return {
          statusCode: Constants.FAIL_CODE,
          message: i18next.t('NOT_FOUND'),
        };
      }
    } catch (error) {
      return ResponseBuilder.errorMessage(error, i18next.t('ERR_INTERNAL_SERVER'));
    }
  };

  public getByID = async (id: any) => {
    try {
      const result = await User.findOne({ where: { id: id } });
      if (result) {
        return result;
      } else {
        return {
          statusCode: Constants.FAIL_CODE,
          message: i18next.t('NOT_REGISTERDUSER'),
        };
      }
    } catch (error) {
      return ResponseBuilder.errorMessage(error, i18next.t('ERR_INTERNAL_SERVER'));
    }
  };

  public userUpdate = async (id: any, insertData: any) => {
    try {
      if (insertData?.newPassword) {
        const salt = await bcrypt.genSalt(10);
        const newHashPassword = await bcrypt.hash(insertData.newPassword, salt);
        insertData = { password: newHashPassword };
      }
      const result = await User.update(insertData, { where: { id: id } });
      if (result) {
        return result;
      } else {
        return {
          statusCode: Constants.FAIL_CODE,
          message: i18next.t('NOT_REGISTERDUSER'),
        };
      }
    } catch (error) {
      return ResponseBuilder.errorMessage(error, i18next.t('ERR_INTERNAL_SERVER'));
    }
  };

  public userDelete = async (id: any) => {
    try {
      const result = await User.destroy({ where: { id: id } });
      if (result) {
        return result;
      } else {
        return {
          statusCode: Constants.FAIL_CODE,
          message: i18next.t('NOT_REGISTERDUSER'),
        };
      }
    } catch (error) {
      return ResponseBuilder.errorMessage(error, i18next.t('ERR_INTERNAL_SERVER'));
    }
  };

  public userLogout = async (id: any) => {
    try {
      const result = await User.update({ token: 'null' }, { where: { id: id } });
      if (result) {
        return result;
      } else {
        return {
          statusCode: Constants.FAIL_CODE,
          message: i18next.t('NOT_REGISTERDUSER'),
        };
      }
    } catch (error) {
      return ResponseBuilder.errorMessage(error, i18next.t('ERR_INTERNAL_SERVER'));
    }
  };
}

export default AuthUtils;
