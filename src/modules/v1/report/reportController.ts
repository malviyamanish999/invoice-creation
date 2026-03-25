import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import ResponseBuilder from '../../../helpers/responseBuilder';
import { Constants } from '../../../../config/constants';
import reportUtils from './reportUtils';
dotenv.config();

class ReportController {
  ReportUtils = new reportUtils();

  public detailsSummary = async (req: Request, res: Response) => {
    try {
      const startDate = req.query.startDate;
      const endDate = req.query.endDate;
      const result: any = await this.ReportUtils.summaryReport(startDate, endDate);
      if (result?.statusCode && result?.data?.error) {
        return res.status(result.statusCode).json(result.data); // Return error response directly
      }
      if (result.length != 0) {
        return res.status(200).json(ResponseBuilder.data(result, req.t('GET_ALL_CLIENT_REPORT')));
      } else {
        return res.status(Constants.FAIL_CODE).json(ResponseBuilder.badRequest(req.t('NOT_FOUND')));
      }
    } catch (error: any) {
      return res.status(500).send({
        statusCode: Constants.INTERNAL_SERVER_ERROR_CODE,
        error: error.toString(),
        message: req.t('ERR_INTERNAL_SERVER'),
      });
    }
  };

  public betweenDatesSummary = async (req: Request, res: Response) => {
    try {
      const startDate = req.query.startDate;
      const endDate = req.query.endDate;
      const result = await this.ReportUtils.datesBetweenSummary(startDate, endDate);
      if (result?.statusCode && result?.data?.error) {
        return res.status(result.statusCode).json(result.data); // Return error response directly
      }
      return res.status(200).json(ResponseBuilder.data(result, req.t('LOST_CLIENT_REPORT')));
    } catch (error: any) {
      return res.status(500).send({
        statusCode: Constants.INTERNAL_SERVER_ERROR_CODE,
        error: error.toString(),
        message: req.t('ERR_INTERNAL_SERVER'),
      });
    }
  };

  public lostClientDetails = async (req: Request, res: Response) => {
    try {
      const startDate = req.query.startDate;
      const endDate = req.query.endDate;
      const result: any = await this.ReportUtils.lostClientReport(startDate, endDate);
      if (result?.statusCode && result?.data?.error) {
        return res.status(result.statusCode).json(result.data); // Return error response directly
      }
      if (result.length != 0) {
        return res.status(200).json(ResponseBuilder.data(result, req.t('LOST_CLIENT_REPORT')));
      } else {
        return res.status(Constants.FAIL_CODE).json(ResponseBuilder.badRequest(req.t('NOT_FOUND')));
      }
    } catch (error: any) {
      return res.status(500).send({
        statusCode: Constants.INTERNAL_SERVER_ERROR_CODE,
        error: error.toString(),
        message: req.t('ERR_INTERNAL_SERVER'),
      });
    }
  };

  public Summary = async (req: Request, res: Response) => {
    try {
      const startDate = req.query.startDate;
      const endDate = req.query.endDate;
      const result: any = await this.ReportUtils.newsummaryReport(startDate, endDate);
      if (result?.statusCode && result?.data?.error) {
        return res.status(result.statusCode).json(result.data); // Return error response directly
      }
      if (result.length != 0) {
        return res.status(200).json(ResponseBuilder.data(result, req.t('GET_ALL_CLIENT_REPORT')));
      } else {
        return res.status(Constants.FAIL_CODE).json(ResponseBuilder.badRequest(req.t('NOT_FOUND')));
      }
    } catch (error: any) {
      return res.status(500).send({
        statusCode: Constants.INTERNAL_SERVER_ERROR_CODE,
        error: error.toString(),
        message: req.t('ERR_INTERNAL_SERVER'),
      });
    }
  };

  public lostClientSummary = async (req: Request, res: Response) => {
    try {
      const startDate = req.query.startDate;
      const endDate = req.query.endDate;
      const result: any = await this.ReportUtils.lostClientSummaryReport(startDate, endDate);
      if (result?.statusCode && result?.data?.error) {
        return res.status(result.statusCode).json(result.data); // Return error response directly
      }
      if (result.length != 0) {
        return res.status(200).json(ResponseBuilder.data(result, req.t('LOST_CLIENT_REPORT')));
      } else {
        return res.status(Constants.FAIL_CODE).json(ResponseBuilder.badRequest(req.t('NOT_FOUND')));
      }
    } catch (error: any) {
      return res.status(500).send({
        statusCode: Constants.INTERNAL_SERVER_ERROR_CODE,
        error: error.toString(),
        message: req.t('ERR_INTERNAL_SERVER'),
      });
    }
  };
}

export default ReportController;
