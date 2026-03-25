import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import ResponseBuilder from '../../../helpers/responseBuilder';
import { Constants } from '../../../../config/constants';
import industryTypeUtils from './industryTypeUtils';
dotenv.config();

class IndustryTypeController {
  IndustryTypeUtils = new industryTypeUtils();

  public create = async (req: Request, res: Response) => {
    const applicationData = req.body;
    const result = await this.IndustryTypeUtils.industryTypeAdd(applicationData);
    if (result.code === Constants.FAIL_CODE) {
      return res.status(result.code).json(result);
    } else {
      const response = {
        statusCode: Constants.SUCCESS_CODE,
        message: req.t('INDUSTRY_TYPE_ADD'),
      };
      return res.json(response);
    }
  };

  public getAll = async (req: Request, res: Response) => {
    try {
      const result = await this.IndustryTypeUtils.industryTypegetAll();
      if (result) {
        return res.status(200).json(ResponseBuilder.data(result, req.t('GET_ALL')));
      } else {
        return res.status(Constants.FAIL_CODE).json(ResponseBuilder.badRequest(req.t('NOT_FOUND')));
      }
    } catch (error) {
      return res.status(500).send({
        error: error,
        message: req.t('ERR_INTERNAL_SERVER'),
      });
    }
  };

  public findById = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const result = await this.IndustryTypeUtils.industryTypefindById(id);
      if (result?.message) {
        return res.status(result.statusCode).json(ResponseBuilder.badRequest(req.t(result?.message)));
      }
      return res.status(200).json(ResponseBuilder.data(result, req.t('INDUSTRY_TYPE_FINDBYID')));
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
      const result = await this.IndustryTypeUtils.industryTypefindById(id);
      if (result?.message) {
        return res.status(result.statusCode).json(ResponseBuilder.badRequest(req.t(result?.message)));
      }
      if (result) {
        const applicationData = req.body;
        const update = await this.IndustryTypeUtils.industryTypeupdate(id, applicationData);
        return res.status(200).json(ResponseBuilder.data(update, req.t('DATA_UPDATE')));
      } else {
        return res.status(Constants.FAIL_CODE).json(ResponseBuilder.badRequest(req.t('INDUSTRY_TYPE_NOT_FOUND')));
      }
    } catch (error) {
      return res.status(500).send({
        error: error,
        message: req.t('ERR_INTERNAL_SERVER'),
      });
    }
  };

  public Delete = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const result = await this.IndustryTypeUtils.industryTypeDelete(id);
      if (result?.message) {
        return res.status(result.statusCode).json(ResponseBuilder.badRequest(req.t(result?.message)));
      }
      return res.status(200).json(ResponseBuilder.successMessage(req.t('DATA_DELETE')));
    } catch (error) {
      return res.status(500).send({
        error: error,
        message: req.t('ERR_INTERNAL_SERVER'),
      });
    }
  };
}

export default IndustryTypeController;
