import * as dotenv from 'dotenv';
import db from '../../../database/db';
import ResponseBuilder from '../../../helpers/responseBuilder';
import i18next from 'i18next';
import { Constants } from '../../../../config/constants';

dotenv.config();

const State = db.state;

class StateUtils {
  public stateAdd = async (insertData: any) => {
    try {
      const data = {
        name: insertData.name,
        no: insertData.no,
      };
      const result = State.create(data);
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

  public stategetAll = async () => {
    try {
      const result = await State.findAll();
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

  public statefindById = async (id: any) => {
    try {
      const result = await State.findByPk(id);
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

  public stateupdate = async (id: any, insertData: any) => {
    try {
      const result = await State.update(insertData, { where: { id: id } });
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

  public stateDelete = async (id: any) => {
    try {
      const result = await State.destroy({ where: { id: id } });
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

  public getCountry = async (query: any) => {
    try {
      const where = `where states.countryCode = '${query}'`;
      const dataQuery = db.sequelize;
      const checkCountry = await dataQuery.query(
        `select states.name as stateName , states.countryCode, states.isoCode as stateCode , countries.name as countryName, countries.isoCode as countryCode from countries left join states on 
         countries.isoCode = states.countryCode ${where};`,
      );
      return checkCountry[0];
    } catch (error) {
      return ResponseBuilder.errorMessage(error, i18next.t('ERR_INTERNAL_SERVER'));
    }
  };
}

export default StateUtils;
