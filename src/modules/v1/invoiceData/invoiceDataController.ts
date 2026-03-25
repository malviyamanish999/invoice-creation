import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import ResponseBuilder from '../../../helpers/responseBuilder';
import { Constants } from '../../../../config/constants';
import invoiceDataUtils from './invoiceDataUtils';
dotenv.config();

class InvoiceDataController {
  InvoiceDataUtils = new invoiceDataUtils();

  public create = async (req: Request, res: Response) => {
    try {
      const applicationData = req.body;
      const result = await this.InvoiceDataUtils.invoiceDataAdd(applicationData);
      if (result?.message) {
        return res.status(result.statusCode).json(ResponseBuilder.badRequest(req.t(result?.message)));
      } else if (result?.statusCode && result?.data?.error) {
        return res.status(result.statusCode).json(result.data); // Return error response directly
      } else {
        const response = {
          statusCode: Constants.SUCCESS_CODE,
          message: req.t('INVOICE_CREATE'),
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
      const result: any = await this.InvoiceDataUtils.invoiceDatagetAll(req?.query);
      if (result) {
        return res.status(200).json(ResponseBuilder.data(result, req.t('GET_ALL')));
      } else if (result?.statusCode && result?.data?.error) {
        return res.status(result.statusCode).json(result.data); // Return error response directly
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
      const result = await this.InvoiceDataUtils.invoiceDatafindById(id);
      if (result?.message) {
        return res.status(result.statusCode).json(ResponseBuilder.badRequest(req.t(result?.message)));
      }
      if (result?.statusCode && result?.data?.error) {
        return res.status(result.statusCode).json(result.data); // Return error response directly
      }
      return res.status(200).json(ResponseBuilder.data(result, req.t('INVOICE_FINDBYID')));
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
      const result = await this.InvoiceDataUtils.invoiceDatafindById(id);
      if (result?.message) {
        return res.status(result.statusCode).json(ResponseBuilder.badRequest(req.t(result?.message)));
      }
      if (result) {
        const applicationData = req.body;
        const update = await this.InvoiceDataUtils.invoiceDataupdate(id, applicationData);
        return res.status(200).json(ResponseBuilder.data(update, req.t('DATA_UPDATE')));
      } else {
        return res.status(Constants.FAIL_CODE).json(ResponseBuilder.badRequest(req.t('INVOICE_NOT_FOUND')));
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
      const result = await this.InvoiceDataUtils.invoiceDataDelete(id);
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

  public convertPDF = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const result: any = await this.InvoiceDataUtils.invoiceDataTopdf(id);
      if (result?.message) {
        return res.status(result.statusCode).json(ResponseBuilder.badRequest(req.t(result?.message)));
      }
      if (result?.statusCode && result?.data?.error) {
        return res.status(result.statusCode).json(result.data); // Return error response directly
      }
      return res.status(200).json(ResponseBuilder.data(result, req.t('PDF_GENERATE')));
    } catch (error: any) {
      return res.status(500).send({
        statusCode: Constants.INTERNAL_SERVER_ERROR_CODE,
        error: error.toString(),
        message: req.t('ERR_INTERNAL_SERVER'),
      });
    }
  };

  public pdfSendEmail = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const result: any = await this.InvoiceDataUtils.invoicePdfsentEmail(id);
      if (result?.message) {
        return res.status(result.statusCode).json(ResponseBuilder.badRequest(req.t(result?.message)));
      }
      if (result?.statusCode && result?.data?.error) {
        return res.status(result.statusCode).json(result.data); // Return error response directly
      }
      return res.status(200).json(ResponseBuilder.data(result, req.t('Mail Send successfully')));
    } catch (error: any) {
      return res.status(500).send({
        statusCode: Constants.INTERNAL_SERVER_ERROR_CODE,
        error: error.toString(),
        message: req.t('ERR_INTERNAL_SERVER'),
      });
    }
  };

  public lostClient = async (req: Request, res: Response) => {
    try {
      const update = await this.InvoiceDataUtils.invoiceLostClient();
      if (update) {
        return res.status(200).json(ResponseBuilder.data(update, req.t('TODAY_LOST_CLIENT')));
      } else {
        return res.status(Constants.FAIL_CODE).json(ResponseBuilder.badRequest(req.t('INVOICE_NOT_FOUND')));
      }
    } catch (error) {
      return res.status(500).send({
        error: error,
        message: req.t('ERR_INTERNAL_SERVER'),
      });
    }
  };

  public findCustomerInvoice = async (req: Request, res: Response) => {
    try {
      const result: any = await this.InvoiceDataUtils.findCustomerInvoice(req?.query);
      if (result?.message) {
        return res.status(result.statusCode).json(ResponseBuilder.badRequest(req.t(result?.message)));
      }
      if (result?.statusCode && result?.data?.error) {
        return res.status(result.statusCode).json(result.data); // Return error response directly
      }
      return res
        .status(Constants.SUCCESS_CODE)
        .json(ResponseBuilder.data(result, req.t('INVOICE_FIND_BY_CUSTOMER_ID')));
    } catch (error: any) {
      return res.status(Constants.INTERNAL_SERVER_ERROR_CODE).send({
        statusCode: Constants.INTERNAL_SERVER_ERROR_CODE,
        error: error.toString(),
        message: req.t('ERR_INTERNAL_SERVER'),
      });
    }
  };
}

export default InvoiceDataController;
