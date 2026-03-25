import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import ResponseBuilder from '../../../helpers/responseBuilder';
import { Constants } from '../../../../config/constants';
import billSeriesUtils from './billseriesUtils';
dotenv.config();

class BillSeriesController {
  BillSeriesUtils = new billSeriesUtils();

  public create = async (req: Request, res: Response) => {
    const applicationData = req.body;
    const result = await this.BillSeriesUtils.billSeriesAdd(applicationData);
    if (result?.message) {
      return res.status(result.statusCode).json(ResponseBuilder.badRequest(req.t(result?.message)));
    } else {
      const response = {
        statusCode: Constants.SUCCESS_CODE,
        message: req.t('BILL_SERIES'),
      };
      return res.json(response);
    }
  };

  public getAll = async (req: Request, res: Response) => {
    try {
      const result = await this.BillSeriesUtils.billSeriesgetAll(req?.query);
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
      const result = await this.BillSeriesUtils.billSeriesfindById(id);
      if (result?.message) {
        return res.status(result.statusCode).json(ResponseBuilder.badRequest(req.t(result?.message)));
      }
      return res.status(200).json(ResponseBuilder.data(result, req.t('BILL_SERIES_FINDBYID')));
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
      const result = await this.BillSeriesUtils.billSeriesfindById(id);
      if (result?.message) {
        return res.status(result.statusCode).json(ResponseBuilder.badRequest(req.t(result?.message)));
      }
      if (result) {
        const applicationData = req.body;
        const update = await this.BillSeriesUtils.billSeriesupdate(id, applicationData);
        return res.status(200).json(ResponseBuilder.data(update, req.t('DATA_UPDATE')));
      } else {
        return res.status(Constants.FAIL_CODE).json(ResponseBuilder.badRequest(req.t('BILL_SERIES_NOT_FOUND')));
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
      const result = await this.BillSeriesUtils.billSeriesDelete(id);
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

export default BillSeriesController;
