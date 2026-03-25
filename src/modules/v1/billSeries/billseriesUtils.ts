import * as dotenv from 'dotenv';
import db from '../../../database/db';
import ResponseBuilder from '../../../helpers/responseBuilder';
import i18next from 'i18next';
import { Constants } from '../../../../config/constants';

dotenv.config();

const BillSeries = db.bill_series;

class BillSeriesUtils {
  public billSeriesAdd = async (insertData: any) => {
    try {
      const data = {
        series: insertData.series,
        from: insertData.from,
        to: insertData.to,
        seriesType: insertData?.seriesType,
        seriesStart: insertData?.seriesStart,
      };
      const result = BillSeries.create(data);
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

  public billSeriesgetAll = async (reqQuery: any) => {
    try {
      const page = parseInt(reqQuery?.page) || 1;
      const limit = parseInt(reqQuery?.limit) || Constants.DATA_LIMIT;
      let where = {};

      const offset = limit * (page - 1);
      const { seriesType } = reqQuery;
      if (reqQuery?.seriesType) {
        where = {
          seriesType: seriesType,
        };
      }
      const response = await BillSeries.findAndCountAll({
        limit: limit,
        offset: offset,
        where,
        order: [['id', 'ASC']], // Sort by id in ascending order
      });
      if (response?.count > 0) {
        const count = response.count;
        const pages = Math.ceil(count / limit);
        return { result: response?.rows, count: count, pages: pages };
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

  public billSeriesfindById = async (id: any) => {
    try {
      const result = await BillSeries.findByPk(id);
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

  public billSeriesupdate = async (id: any, insertData: any) => {
    try {
      const result = await BillSeries.update(insertData, { where: { id: id } });
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

  public billSeriesDelete = async (id: any) => {
    try {
      const result = await BillSeries.destroy({ where: { id: id } });
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

export default BillSeriesUtils;
