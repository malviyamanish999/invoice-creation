import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import ResponseBuilder from '../../../helpers/responseBuilder';
import { Constants } from '../../../../config/constants';
import paymentRecordUtils from './paymentRecordUtils';
dotenv.config();

class PaymentRecordController {
  PaymentRecordUtils = new paymentRecordUtils();

  public create = async (req: Request, res: Response) => {
    try {
      const applicationData = req.body;
      const result = await this.PaymentRecordUtils.paymentRecordAdd(applicationData);
      if (result?.statusCode && result?.data?.error) {
        return res.status(result.statusCode).json(result.data); // Return error response directly
      }
      if (result.code === Constants.FAIL_CODE) {
        return res.status(result.code).json(result);
      } else {
        const response = {
          statusCode: Constants.SUCCESS_CODE,
          message: req.t('PAYMENT_ADD'),
        };
        return res.json(response);
      }
    } catch (error: any) {
      return res.status(500).send({
        statusCode: Constants.INTERNAL_SERVER_ERROR_CODE,
        error: error.toString(),
        message: req.t('ERR_INTERNAL_SERVER'),
      });
    }
  };

  public getAll = async (req: Request, res: Response) => {
    try {
      const result: any = await this.PaymentRecordUtils.paymentRecordgetAll(req?.query);
      if (result?.statusCode && result?.data?.error) {
        return res.status(result.statusCode).json(result.data); // Return error response directly
      }
      if (result) {
        return res.status(200).json(ResponseBuilder.data(result, req.t('GET_ALL')));
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

  public findById = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const result = await this.PaymentRecordUtils.paymentRecordfindById(id);
      if (result?.message) {
        return res.status(result.statusCode).json(ResponseBuilder.badRequest(req.t(result?.message)));
      } else if (result?.statusCode && result?.data?.error) {
        return res.status(result.statusCode).json(result.data); // Return error response directly
      } else {
        return res.status(200).json(ResponseBuilder.data(result, req.t('PAYMENT_FINDBYID')));
      }
    } catch (error: any) {
      return res.status(500).send({
        statusCode: Constants.INTERNAL_SERVER_ERROR_CODE,
        error: error.toString(),
        message: req.t('ERR_INTERNAL_SERVER'),
      });
    }
  };

  public Update = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const result = await this.PaymentRecordUtils.paymentRecordfindById(id);
      if (result?.message) {
        return res.status(result.statusCode).json(ResponseBuilder.badRequest(req.t(result?.message)));
      }
      if (result) {
        const applicationData = req.body;
        const update = await this.PaymentRecordUtils.paymentRecordupdate(id, applicationData);
        return res.status(200).json(ResponseBuilder.data(update, req.t('DATA_UPDATE')));
      } else {
        return res.status(Constants.FAIL_CODE).json(ResponseBuilder.badRequest(req.t('PAYMENT_NOT_FOUND')));
      }
    } catch (error: any) {
      return res.status(500).send({
        statusCode: Constants.INTERNAL_SERVER_ERROR_CODE,
        error: error.toString(),
        message: req.t('ERR_INTERNAL_SERVER'),
      });
    }
  };

  public Delete = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const result = await this.PaymentRecordUtils.paymentRecordDelete(id);
      if (result?.message) {
        return res.status(result.statusCode).json(ResponseBuilder.badRequest(req.t(result?.message)));
      }
      return res.status(200).json(ResponseBuilder.successMessage(req.t('DATA_DELETE')));
    } catch (error: any) {
      return res.status(500).send({
        statusCode: Constants.INTERNAL_SERVER_ERROR_CODE,
        error: error.toString(),
        message: req.t('ERR_INTERNAL_SERVER'),
      });
    }
  };

  public getAllCustomerbyPayment = async (req: Request, res: Response) => {
    try {
      const result: any = await this.PaymentRecordUtils.paymentRecordByInvoice(req?.query);
      if (result?.statusCode && result?.data?.error) {
        return res.status(result.statusCode).json(result.data); // Return error response directly
      }
      return res.status(200).json(ResponseBuilder.data(result, req.t('GET_ALL')));
    } catch (error: any) {
      return res.status(500).send({
        statusCode: Constants.INTERNAL_SERVER_ERROR_CODE,
        error: error.toString(),
        message: req.t('ERR_INTERNAL_SERVER'),
      });
    }
  };

  public getAllTotalamountCustomer = async (req: Request, res: Response) => {
    try {
      const result: any = await this.PaymentRecordUtils.totalAmountofCustomer(req.query);
      if (result?.statusCode && result?.data?.error) {
        return res.status(result.statusCode).json(result.data); // Return error response directly
      }
      return res.status(200).json(ResponseBuilder.data(result, req.t('GET_ALL')));
    } catch (error: any) {
      return res.status(500).send({
        statusCode: Constants.INTERNAL_SERVER_ERROR_CODE,
        error: error.toString(),
        message: req.t('ERR_INTERNAL_SERVER'),
      });
    }
  };

  public getPaymentRecordByCustomerId = async (req: Request, res: Response) => {
    try {
      const result: any = await this.PaymentRecordUtils.getPaymentRecordByCustomerId(req.query);
      if (result?.statusCode && result?.data?.error) {
        return res.status(result.statusCode).json(result.data); // Return error response directly
      }
      return res.status(200).json(ResponseBuilder.data(result, req.t('PAYMENT_RECORD_WITH_INVOICE_DATA')));
    } catch (error: any) {
      return res.status(500).send({
        statusCode: Constants.INTERNAL_SERVER_ERROR_CODE,
        error: error.toString(),
        message: req.t('ERR_INTERNAL_SERVER'),
      });
    }
  };

  public updateAndLinkPayment = async (req: Request, res: Response) => {
    try {
      const result = await this.PaymentRecordUtils.paymentRecordfindById(req?.body?.paymentId);
      if (result?.message) {
        return res.status(result.statusCode).json(ResponseBuilder.badRequest(req.t(result?.message)));
      }
      if (result) {
        const applicationData = req.body;
        const update: any = await this.PaymentRecordUtils.updateAndLinkPayment(applicationData);
        if (update?.error) {
          return res.status(update?.statusCode).json(update);
        }
        return res.status(200).json(ResponseBuilder.data(update, req.t('DATA_UPDATE')));
      } else {
        return res.status(Constants.FAIL_CODE).json(ResponseBuilder.badRequest(req.t('PAYMENT_NOT_FOUND')));
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

export default PaymentRecordController;
