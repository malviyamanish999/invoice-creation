import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import ResponseBuilder from '../../../helpers/responseBuilder';
import { Constants } from '../../../../config/constants';
import razorPayUtils from './razorPayUtils';
dotenv.config();

class RazorPayController {
  razorPayUtils = new razorPayUtils();

  public payment = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const result = await this.razorPayUtils.invoicePayment(id);
      if (result?.message) {
        return res.status(result.statusCode).json(ResponseBuilder.badRequest(req.t(result?.message)));
      }
      return res.status(200).json(ResponseBuilder.data(result, req.t('INVOICE_FINDBYID')));
    } catch (error) {
      return res.status(500).send({
        error: error,
        message: req.t('ERR_INTERNAL_SERVER'),
      });
    }
  };

  public verify = async (req: Request, res: Response) => {
    try {
      const applicationData = req.body;
      const result = await this.razorPayUtils.verifyPayment(applicationData);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).send({
        error: error,
        message: req.t('ERR_INTERNAL_SERVER'),
      });
    }
  };

  public paymentLink = async (req: Request, res: Response) => {
    try {
      const invoice_no = req.query.invoice_no;
      const result: any = await this.razorPayUtils.paymentLink(invoice_no);
      if (result?.message) {
        return res.status(result.statusCode).json(ResponseBuilder.badRequest(req.t(result?.message)));
      }
      if (result?.statusCode && result?.data?.error) {
        return res.status(result.statusCode).json(result.data); // Return error response directly
      }
      return res.status(200).json(ResponseBuilder.successMessage('Payment link send successfully'));
    } catch (error: any) {
      return res.status(500).send({
        statusCode: Constants.INTERNAL_SERVER_ERROR_CODE,
        error: error.toString(),
        message: req.t('ERR_INTERNAL_SERVER'),
      });
    }
  };

  public paymentLinkQuotation = async (req: Request, res: Response) => {
    try {
      const quotation_no = req.query.quotation_no;
      const result: any = await this.razorPayUtils.paymentLinkQuotation(quotation_no);
      if (result?.message) {
        return res.status(result.statusCode).json(ResponseBuilder.badRequest(req.t(result?.message)));
      }
      if (result?.statusCode && result?.data?.error) {
        return res.status(result.statusCode).json(result.data); // Return error response directly
      }
      return res.status(200).json(ResponseBuilder.successMessage(req.t('Payment link send successfully')));
    } catch (error: any) {
      return res.status(500).send({
        statusCode: Constants.INTERNAL_SERVER_ERROR_CODE,
        error: error.toString(),
        message: req.t('ERR_INTERNAL_SERVER'),
      });
    }
  };

  public paymentNotifyBy = async (req: Request, res: Response) => {
    try {
      const paymentLinkId = req.query.paymentLinkId;
      const medium = req.query.medium;
      const result = await this.razorPayUtils.paymentnNotifyBy(paymentLinkId, medium);
      if (result?.message) {
        return res.status(result.statusCode).json(ResponseBuilder.badRequest(req.t(result?.message)));
      }
      return res.status(200).json(ResponseBuilder.successMessage(req.t('PAYMENT_LINK')));
    } catch (error) {
      return res.status(500).send({
        error: error,
        message: req.t('ERR_INTERNAL_SERVER'),
      });
    }
  };

  public fetchPaymentLink = async (req: Request, res: Response) => {
    try {
      const paymentData = req.query;
      const result = await this.razorPayUtils.paymentFetchByID(paymentData);
      if (result?.message) {
        return res.status(result.statusCode).json(ResponseBuilder.badRequest(req.t(result?.message)));
      }
      if (result?.statusCode && result?.data?.error) {
        return res.status(result.statusCode).json(result.data); // Return error response directly
      }
      return res.status(200).json(ResponseBuilder.data(result, req.t('Fetch data Successfully')));
    } catch (error: any) {
      return res.status(500).send({
        statusCode: Constants.INTERNAL_SERVER_ERROR_CODE,
        error: error.toString(),
        message: req.t('ERR_INTERNAL_SERVER'),
      });
    }
  };

  public razorpayPlans = async (req: Request, res: Response) => {
    try {
      const result: any = await this.razorPayUtils.plansRazorpay();
      if (result?.message) {
        return res.status(result.statusCode).json(ResponseBuilder.badRequest(req.t(result?.message)));
      }
      return res.status(200).json(ResponseBuilder.data(result, req.t('GET_ALL_RAZORPAY_PLANS')));
    } catch (error) {
      return res.status(500).send({
        error: error,
        message: req.t('ERR_INTERNAL_SERVER'),
      });
    }
  };

  public subscriptionsLinkQuotation = async (req: Request, res: Response) => {
    try {
      const quotation_no = req.query.quotation_no;
      const result: any = await this.razorPayUtils.QuotationsubscriptionsLinkRazorpay(quotation_no);
      if (result?.message) {
        return res.status(result.statusCode).json(ResponseBuilder.badRequest(req.t(result?.message)));
      }
      return res.status(200).json(ResponseBuilder.successMessage(req.t('PAYMENT_LINK')));
    } catch (error) {
      return res.status(500).send({
        error: error,
        message: req.t('ERR_INTERNAL_SERVER'),
      });
    }
  };

  public subscriptionsLinkInvoice = async (req: Request, res: Response) => {
    try {
      const invoice_no = req.query.invoice_no;
      const result: any = await this.razorPayUtils.InvoicesubscriptionsLinkRazorpay(invoice_no);
      if (result?.message) {
        return res.status(result.statusCode).json(ResponseBuilder.badRequest(req.t(result?.message)));
      }
      return res.status(200).json(ResponseBuilder.successMessage(req.t('PAYMENT_LINK')));
    } catch (error) {
      return res.status(500).send({
        error: error,
        message: req.t('ERR_INTERNAL_SERVER'),
      });
    }
  };

  public webhookRazorpay = async (req: Request, res: Response) => {
    try {
      const webhookData = req?.body;
      const signatureHeader = req?.headers['x-razorpay-signature'];
      const result: any = await this.razorPayUtils.webhookRazorpay(webhookData, signatureHeader);
      if (result?.message) {
        return res.status(result.statusCode).json(ResponseBuilder.badRequest(req.t(result?.message)));
      }
      return res.status(Constants.SUCCESS_CODE).json(ResponseBuilder.successMessage(req.t('PAYMENT_LINK_PAID')));
    } catch (error) {
      return res.status(Constants.INTERNAL_SERVER_ERROR_CODE).send({
        error: error,
        message: req.t('ERR_INTERNAL_SERVER'),
      });
    }
  };
}

export default RazorPayController;
