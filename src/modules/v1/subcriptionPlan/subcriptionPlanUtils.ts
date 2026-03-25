import * as dotenv from 'dotenv';
import db from '../../../database/db';
import ResponseBuilder from '../../../helpers/responseBuilder';
import i18next from 'i18next';
import { Constants } from '../../../../config/constants';

dotenv.config();

const SubcriptionPlan = db.subcription_plan;

class SubcriptionPlanUtils {
  public subcruptionPlanAdd = async (insertData: any) => {
    try {
      const data = {
        type: insertData.type,
        rate: insertData.rate,
      };
      const result = db.subcription_plan.create(data);
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

  public subcriptionPlangetAll = async (reqQuery: any) => {
    try {
      const page = parseInt(reqQuery?.page) || 1;
      const limit = parseInt(reqQuery?.limit) || Constants.DATA_LIMIT;
      const offset = limit * (page - 1);

      const result = await SubcriptionPlan.findAndCountAll({
        limit: limit,
        offset: offset,
        order: [['id', 'DESC']], // Sort by id in descending order
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

  public subcruptionPlanfindById = async (id: any) => {
    try {
      const result = await SubcriptionPlan.findByPk(id);
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

  public subcruptionPlanupdate = async (id: any, insertData: any) => {
    try {
      const result = await SubcriptionPlan.update(insertData, { where: { id: id } });
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

  public subcruptionPlanDelete = async (id: any) => {
    try {
      const result = await SubcriptionPlan.destroy({ where: { id: id } });
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

export default SubcriptionPlanUtils;
