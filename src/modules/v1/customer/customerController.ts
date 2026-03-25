import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import ResponseBuilder from '../../../helpers/responseBuilder';
import { Constants } from '../../../../config/constants';
import customerUtils from './customerUtils';
dotenv.config();

class CustomerController {
  CustomerUtils = new customerUtils();

  public create = async (req: Request, res: Response) => {
    const applicationData = req.body;

    // NOTE: Removed validation of GST-Number pattern for now.

    // if (applicationData?.gst_no) {
    //   const checkGstno = Constants.gstNoregexPattern.test(applicationData?.gst_no);
    //   if (checkGstno === false) {
    //     const response = {
    //       statusCode: Constants.FAIL_CODE,
    //       message: req.t('GST_NUMBER'),
    //     };
    //     return res.json(response);
    //   }
    // }

    const result = await this.CustomerUtils.customerAdd(applicationData);
    if (result?.message) {
      return res.status(result.statusCode).json(ResponseBuilder.badRequest(req.t(result?.message)));
    }
    if (result.code === Constants.FAIL_CODE) {
      return res.status(result.code).json(result);
    } else {
      const response = {
        statusCode: Constants.SUCCESS_CODE,
        message: req.t('CUSTOMER_REGISTER'),
      };
      return res.json(response);
    }
  };

  public getAll = async (req: Request, res: Response) => {
    try {
      const result = await this.CustomerUtils.customergetAll(req?.query);
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
      const result = await this.CustomerUtils.customerfindById(id);
      if (result?.message) {
        return res.status(result.statusCode).json(ResponseBuilder.badRequest(req.t(result?.message)));
      }
      return res.status(200).json(ResponseBuilder.data(result, req.t('CUSTOMER_FINDBYID')));
    } catch (error) {
      return res.status(500).send({
        error: error,
        message: req.t('ERR_INTERNAL_SERVER'),
      });
    }
  };

  public Update = async (req: any, res: Response) => {
    try {
      const id = req.params.id;
      const result = await this.CustomerUtils.customerfindById(id);
      if (result?.message) {
        return res.status(result.statusCode).json(ResponseBuilder.badRequest(req.t(result?.message)));
      }
      if (result) {
        const applicationData = req.body;
        const update = await this.CustomerUtils.customerupdate(id, applicationData);
        return res.status(200).json(ResponseBuilder.data(update, req.t('DATA_UPDATE')));
      } else {
        return res.status(Constants.FAIL_CODE).json(ResponseBuilder.badRequest(req.t('CUSTOMER_NOT_FOUND')));
      }
    } catch (error) {
      return res.status(500).send({
        error: error,
        message: req.t('ERR_INTERNAL_SERVER'),
      });
    }
  };

  public gstFileUpdate = async (req: any, res: Response) => {
    try {
      const id = req.params.id;
      const result = await this.CustomerUtils.customerfindById(id);
      if (result?.message) {
        return res.status(result.statusCode).json(ResponseBuilder.badRequest(req.t(result?.message)));
      }
      if (result) {
        const applicationData = req.body;
        const gstFile = req.files ? req.files.gstFile : null;
        await this.CustomerUtils.customerGstFileUpload(id, applicationData, gstFile);
        return res.status(200).json(ResponseBuilder.successMessage(req.t('GST File upload successfully')));
      } else {
        return res.status(Constants.FAIL_CODE).json(ResponseBuilder.badRequest(req.t('CUSTOMER_NOT_FOUND')));
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
      const result = await this.CustomerUtils.customerDelete(id);
      // Validate request
      if (!result) {
        return res.status(Constants.FAIL_CODE).json(ResponseBuilder.badRequest(req.t('CUSTOMER_NOT_FOUND')));
      }
      return res.status(200).json(ResponseBuilder.data(result, req.t('DATA_DELETE')));
    } catch (error) {
      return res.status(500).send({
        error: error,
        message: req.t('ERR_INTERNAL_SERVER'),
      });
    }
  };

  public getCustomerDetails = async (req: Request, res: Response) => {
    try {
      const result: any = await this.CustomerUtils.getCustomerDetails(req?.query);
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

  public updateCustomerDetails = async (req: any, res: Response) => {
    try {
      const result = await this.CustomerUtils.updateCustomerDetails(req);
      if (result?.error) {
        return res
          .status(result.statusCode)
          .json(ResponseBuilder.badRequest(req.t(result?.error || 'CUSTOMER_NOT_FOUND')));
      } else {
        return res
          .status(Constants.SUCCESS_CODE)
          .json(ResponseBuilder.data(result, req.t('CUSTOMER_ACTIIVTY_LOG_CREATE')));
      }
    } catch (error) {
      return res.status(Constants.INTERNAL_SERVER_ERROR_CODE).send({
        error: error,
        message: req.t('ERR_INTERNAL_SERVER'),
      });
    }
  };

  public getLogDetails = async (req: Request, res: Response) => {
    try {
      const result: any = await this.CustomerUtils.getLogDetails(req?.query);
      if (result) {
        return res.status(Constants.SUCCESS_CODE).json(ResponseBuilder.data(result, req.t('GET_ACTIVITY_LOG')));
      } else {
        return res.status(Constants.FAIL_CODE).json(ResponseBuilder.badRequest(req.t('NOT_FOUND')));
      }
    } catch (error) {
      return res.status(Constants.INTERNAL_SERVER_ERROR_CODE).send({
        error: error,
        message: req.t('ERR_INTERNAL_SERVER'),
      });
    }
  };
}

export default CustomerController;
