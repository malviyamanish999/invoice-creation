import * as dotenv from 'dotenv';
import db from '../../../database/db';
import ResponseBuilder from '../../../helpers/responseBuilder';
import i18next from 'i18next';
import { Constants } from '../../../../config/constants';

dotenv.config();

const financialYear = db.financial_year;

class FinancialYearUtils {
  public financialYearAdd = async (insertData: any) => {
    try {
      const data = {
        year: insertData.year,
      };
      const result = financialYear.create(data);
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

  public financialYeargetAll = async (reqQuery: any) => {
    try {
      const page = parseInt(reqQuery?.page) || 1;
      const limit = parseInt(reqQuery?.limit) || Constants.DATA_LIMIT;
      const offset = limit * (page - 1);

      const result = await financialYear.findAndCountAll({
        limit: limit,
        offset: offset,
        order: [['id', 'DESC']], // Sort by id in ascending order
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

  public financialYearfindById = async (id: any) => {
    try {
      const result = await financialYear.findByPk(id);
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

  public financialYearupdate = async (id: any, insertData: any) => {
    try {
      const result = await financialYear.update(insertData, { where: { id: id } });
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

  public financialYearDelete = async (id: any) => {
    try {
      const result = await financialYear.destroy({ where: { id: id } });
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

export default FinancialYearUtils;
