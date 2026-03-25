import * as dotenv from 'dotenv';
import db from '../../../database/db';
import ResponseBuilder from '../../../helpers/responseBuilder';
import MediaServer from '../../../helpers/mediaServer';
import i18next from 'i18next';
import { Constants } from '../../../../config/constants';
import { AxiosUtils } from '../../../helpers/axios';
import Utils from '../../../helpers/utils';
import { Op } from 'sequelize';

dotenv.config();

const Customer = db.customer;
const User = db.user;
const CustomerActivityLog = db.customerActivityLog;

class CustomerUtils {
  mediaserver = MediaServer;
  public customerAdd = async (insertData: any) => {
    try {
      let panNumber = null;
      if (insertData.gst_no) {
        panNumber = insertData.gst_no.substring(2, 12);
      }
      // find user already exist
      const checkEmail = await Customer.findAll({ where: { email: insertData.email } });
      if (checkEmail && checkEmail.length) {
        return {
          statusCode: Constants.FAIL_CODE,
          message: i18next.t('UNIQ_EMAIL'),
        };
      }
      const checkCompanyName = await Customer.findAll({ where: { company_name: insertData.company_name } });
      if (checkCompanyName && checkCompanyName.length) {
        return {
          statusCode: Constants.FAIL_CODE,
          message: i18next.t('UNIQ_COMPANY_NAME'),
        };
      }
      const data: any = {
        company_name: insertData.company_name,
        client_name: insertData.client_name,
        industries_type: insertData.industries_type,
        mobile_no: insertData.mobile_no,
        email: insertData.email,
        address1: insertData.address1,
        address2: insertData.address2,
        address3: insertData.address3,
        city: insertData.city,
        state: insertData.state,
        country: insertData.country,
        pincode: insertData.pincode,
        gst_no: insertData.gst_no,
        pan_no: panNumber,
        isFromTascopad: insertData?.isFromTascopad || 'No',
        taskopad_user_id: insertData?.taskopad_user_id || null,
      };

      const result = await Customer.create(data);
      if (insertData?.billing_id) {
        const payload = {
          data: {
            user_id: insertData?.taskopad_user_id,
            company_name: insertData.company_name,
            company_address: insertData.address1,
            mobile_number: insertData.mobile_no,
            email: insertData.email,
            gst: insertData.gst_no,
            billing_id: insertData?.billing_id,
          },
        };
        Utils.updateCustomerInTaskopad(payload);
      }
      if (result) {
        return result;
      } else {
        return {
          statusCode: Constants.FAIL_CODE,
          message: i18next.t('VALID_DATA'),
        };
      }
    } catch (error) {
      return ResponseBuilder.errorMessage(error, i18next.t('ERR_INTERNAL_SERVER'));
    }
  };

  public customergetAll = async (reqQuery: any) => {
    try {
      let { page, limit } = reqQuery;
      let offset;
      if (page && limit) {
        page = parseInt(reqQuery?.page);
        limit = parseInt(reqQuery?.limit);
        offset = limit * (page - 1);
      }

      const result = await Customer.findAndCountAll({
        limit,
        offset,
        order: [['id', 'DESC']],
      });

      if (result) {
        const pages = Math.ceil(result.count / limit);
        return { result: result?.rows, count: result.count, pages: pages };
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

  public customerfindById = async (id: any) => {
    try {
      const result = await Customer.findByPk(id);
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

  public customerupdate = async (id: any, insertData: any) => {
    try {
      const result = await Customer.update(insertData, { where: { id: id } });
      if (insertData?.billing_id) {
        const payload = {
          data: {
            user_id: insertData?.taskopad_user_id,
            company_name: insertData?.company_name,
            company_address: insertData?.address1,
            mobile_number: insertData?.mobile_no,
            email: insertData?.email,
            gst: insertData?.gst_no,
            billing_id: insertData?.billing_id,
          },
        };
        Utils.updateCustomerInTaskopad(payload);
      }
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

  public customerGstFileUpload = async (id: any, insertData: any, gstFile?: any) => {
    try {
      const gst_urlData: any = await this.mediaserver.upload(gstFile, 'gstFiles');
      if (gst_urlData) {
        insertData.gstFile = `${process.env.AWS_URL}/gst/` + gst_urlData.name;
      }
      if (insertData.gstFile == '') {
        delete insertData.gstFile;
      }
      const result = await Customer.update(insertData, { where: { id: id } });
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

  public customerDelete = async (id: any) => {
    try {
      const result = await Customer.destroy({ where: { id: id } });
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

  public getCustomerDetails = async (reqQuery: any) => {
    try {
      const { email } = reqQuery;
      const options = {
        method: Constants.REQUEST_TYPE.GET,
        headers: {
          authorization: `Bearer ${process.env.TASKOPAD_AUTH_TOKEN}`,
        },
        url: `${process.env.TASKOPAD_BFF_URL}/invoice/billing-details?email=${email}`,
      };
      const taskOpadCustomerData: any = await AxiosUtils.getRequestedData(options);
      const customerData = await Customer.findOne({
        where: {
          email: email,
        },
      });
      const customer = customerData?.dataValues;
      const result = {
        ...taskOpadCustomerData.result,
        customerId: customer?.id,
        industries_type: customer?.industries_type,
        city: customer?.city,
        state: customer?.state,
        country: customer?.country,
        pincode: customer?.pincode,
      };
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

  public updateCustomerDetails = async (req: any) => {
    try {
      const body = req?.body;
      const email = req._user.email;
      const user = await User.findOne({
        where: {
          email: email,
        },
      });
      if (!user) {
        return ResponseBuilder.badRequest(i18next.t('NOT_FOUND'));
      }
      const { userId, updateField, updatedValue, ownerId } = body;
      // if (
      //   body.updateField ===
      //   (Constants.UPDATE_USER_DATA.EMPLOYEE_LIMIT || Constants.UPDATE_USER_DATA.FILE_STORAGE_LIMIT)
      // ) {
      //   const validLimit = Number(body.existingValue) < Number(updatedValue);
      //   if (!validLimit) {
      //     return ResponseBuilder.badRequest(i18next.t('INVALID_LIMIT'));
      //   }
      // }
      const result: any = await Utils.updateCustomerDetailsInTOP({
        id: userId,
        ownerId: ownerId,
        [updateField]: updatedValue,
      });

      const isUpdatedInTaskopad = result?.code === Constants.SUCCESS_CODE ? true : false;
      const addData = {
        adminId: user.id,
        isUpdatedInTaskopad,
        taskopadUpdateResponse: result?.msg || result?.message,
        ...body,
      };
      return CustomerActivityLog.create(addData);
    } catch (error) {
      return ResponseBuilder.errorMessage(error, i18next.t('ERR_INTERNAL_SERVER'));
    }
  };

  public getLogDetails = async (reqQuery: any) => {
    try {
      const page = parseInt(reqQuery?.page) || 1;
      const limit = parseInt(reqQuery?.limit) || Constants.DATA_LIMIT;
      const offset = (page - 1) * limit;
      const { searchBy, searchValue, search, sortBy, sortType } = reqQuery;
      let where = {};
      let order: any = ['createdAt', 'DESC'];

      if (search) {
        where = {
          [Op.or]: [
            {
              updatedValue: {
                [Op.like]: `%${search}%`,
              },
            },
            {
              existingValue: {
                [Op.like]: `%${search}%`,
              },
            },
          ],
        };
      }

      if (searchBy && searchValue) {
        if (searchBy === Constants.ACTIVITY_LOG.OWNER_ID) {
          where = {
            [searchBy]: searchValue,
          };
        } else {
          where = {
            [searchBy]: {
              [Op.startsWith]: searchValue,
            },
          };
        }
      }

      if (sortBy && sortType) {
        order = [sortBy, sortType];
      }

      const result = await CustomerActivityLog.findAndCountAll({
        offset,
        limit,
        where,
        include: [
          {
            model: User,
            attributes: ['first_name', 'last_name', 'role'],
            as: 'adminUser',
          },
        ],
        order: [order],
      });

      if (result) {
        const pages = Math.ceil(result.count / limit);
        return { result: result?.rows, count: result.count, pages: pages };
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
}

export default CustomerUtils;
