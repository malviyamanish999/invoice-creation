import * as dotenv from 'dotenv';
import db from '../../../database/db';
import ResponseBuilder from '../../../helpers/responseBuilder';
import i18next from 'i18next';
import { Constants } from '../../../../config/constants';

dotenv.config();

const Description = db.description;

class DescriptionUtils {
  public descriptionAdd = async (insertData: any) => {
    try {
      const data = {
        description: insertData.description,
      };
      const result = Description.create(data);
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

  public descriptiongetAll = async (reqQuery: any) => {
    try {
      const page = parseInt(reqQuery?.page) || 1;
      const limit = parseInt(reqQuery?.limit) || Constants.DATA_LIMIT;
      const offset = limit * (page - 1);

      const result = await Description.findAndCountAll({
        limit: limit,
        offset: offset,
        order: [['id', 'ASC']], // Sort by id in ascending order
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

  public descriptionfindById = async (id: any) => {
    try {
      const result = await Description.findByPk(id);
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

  public descriptionupdate = async (id: any, insertData: any) => {
    try {
      const result = await Description.update(insertData, { where: { id: id } });
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

  public descriptionDelete = async (id: any) => {
    try {
      const result = await Description.destroy({ where: { id: id } });
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
}

export default DescriptionUtils;
