import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import ResponseBuilder from '../../../helpers/responseBuilder';
import { Constants } from '../../../../config/constants';
import quotationUtils from './quotationUtils';
dotenv.config();

class QuotationController {
  QuotationUtils = new quotationUtils();

  public create = async (req: Request, res: Response) => {
    try {
      const applicationData = req.body;
      const result = await this.QuotationUtils.quotationDataAdd(applicationData);
      if (result?.message) {
        return res.status(result.statusCode).json(ResponseBuilder.badRequest(req.t(result?.message)));
      } else if (result?.statusCode && result?.data?.error) {
        return res.status(result.statusCode).json(result.data); // Return error response directly
      } else {
        const response = {
          statusCode: Constants.SUCCESS_CODE,
          message: req.t('QUOTATION_CREATE'),
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
      const result: any = await this.QuotationUtils.quotationDatagetAll(req?.query);
      if (result) {
        return res.status(Constants.SUCCESS_CODE).json(ResponseBuilder.data(result, req.t('GET_ALL')));
      } else if (result?.statusCode && result?.data?.error) {
        return res.status(result.statusCode).json(result.data); // Return error response directly
      } else {
        return res.status(Constants.FAIL_CODE).json(ResponseBuilder.badRequest(req.t('NOT_FOUND')));
      }
    } catch (error: any) {
      return res.status(Constants.INTERNAL_SERVER_ERROR_CODE).send({
        statusCode: Constants.INTERNAL_SERVER_ERROR_CODE,
        error: error.toString(),
        message: req.t('ERR_INTERNAL_SERVER'),
      });
    }
  };

  public findById = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const result = await this.QuotationUtils.quotationDatafindById(id);
      if (result?.message) {
        return res.status(result.statusCode).json(ResponseBuilder.badRequest(req.t(result?.message)));
      } else if (result?.statusCode && result?.data?.error) {
        return res.status(result.statusCode).json(result.data); // Return error response directly
      } else {
        return res.status(200).json(ResponseBuilder.data(result, req.t('QUOTATION_FINDBYID')));
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
      const result = await this.QuotationUtils.quotationDatafindById(id);
      if (result?.message) {
        return res.status(result.statusCode).json(ResponseBuilder.badRequest(req.t(result?.message)));
      }
      if (result) {
        const applicationData = req.body;
        const update = await this.QuotationUtils.quotationDataupdate(id, applicationData);
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
      const result = await this.QuotationUtils.quotationDataDelete(id);
      if (result?.message) {
        return res.status(result.statusCode).json(ResponseBuilder.badRequest(req.t(result?.message)));
      }
      if (result?.statusCode && result?.data?.error) {
        return res.status(result.statusCode).json(result.data); // Return error response directly
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

  public InvoiceGenerate = async (req: any, res: Response) => {
    try {
      const id = req.params.id;
      const result = await this.QuotationUtils.quotationToinvoice(id);
      if (result?.message) {
        return res.status(result.statusCode).json(ResponseBuilder.badRequest(req.t(result?.message)));
      }
      if (result?.statusCode && result?.data?.error) {
        return res.status(result.statusCode).json(result.data); // Return error response directly
      }
      return res.status(200).json(ResponseBuilder.successMessage(req.t('QUOTATION_TO_INVOICE')));
    } catch (error: any) {
      return res.status(500).send({
        statusCode: Constants.INTERNAL_SERVER_ERROR_CODE,
        error: error.toString(),
        message: req.t('ERR_INTERNAL_SERVER'),
      });
    }
  };

  public getAllHistory = async (req: Request, res: Response) => {
    try {
      const result = await this.QuotationUtils.quotationHistoryGetall(req?.query);
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

  public quotationHistoryfindById = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const result = await this.QuotationUtils.quotationHistoryfindById(id);
      if (result?.message) {
        return res.status(result.statusCode).json(ResponseBuilder.badRequest(req.t(result?.message)));
      }
      if (result?.statusCode && result?.data?.error) {
        return res.status(result.statusCode).json(result.data); // Return error response directly
      }
      return res.status(200).json(ResponseBuilder.data(result, req.t('QUOTATION_HISTORY_FINDBYID')));
    } catch (error: any) {
      return res.status(500).send({
        statusCode: Constants.INTERNAL_SERVER_ERROR_CODE,
        error: error.toString(),
        message: req.t('ERR_INTERNAL_SERVER'),
      });
    }
  };

  public convertPDF = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const result: any = await this.QuotationUtils.quotationDataTopdf(id);
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
      const result: any = await this.QuotationUtils.quotationPdfsentEmail(id);
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
}

export default QuotationController;
