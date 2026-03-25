import * as dotenv from 'dotenv';
import { Op } from 'sequelize';
import db from '../../../database/db';
import i18next from 'i18next';
import { Constants } from '../../../../config/constants';
import moment from 'moment-timezone';
import utils from '../../../helpers/utils';
import fs from 'fs';
import ejs from 'ejs';
import path from 'path';
import * as pdf from 'html-pdf';
import converter from 'number-to-words';
import sendEmail from '../../../helpers/sendEmail';
const sendMail = new sendEmail();

dotenv.config();

const InvoiceData = db.invoice_data;
const Customer = db.customer;
const State = db.state;
const SubcriptionPlan = db.subcription_plan;
const BillSeries = db.bill_series;
const Quotation = db.quotation;
const QuotationHistory = db.quotation_history;
const Description = db.description;

class QuotationUtils {
  public quotationDataAdd = async (insertData: any) => {
    try {
      const nextQuotationNo = await this.getNextQuotationNo();

      if (nextQuotationNo === null) {
        return this.handleError(Constants.FAIL_CODE, i18next.t('VALID_STATE'));
      }

      const { stateData, taxFields } = await this.getStateDataAndTaxFields(insertData);

      if (!stateData) {
        return this.handleError(Constants.FAIL_CODE, i18next.t('VALID_STATE'));
      }

      if (!this.validateTaxFields(insertData, stateData)) {
        return this.handleError(Constants.FAIL_CODE, i18next.t('VALID_DATA'));
      }

      const { license_start_date, license_end_date, extendExpiryDate }: any = await this.calculateLicenseDates(
        insertData,
      );

      const quotationData = {
        quotation_no: nextQuotationNo,
        customer_name: insertData.customer_name,
        subcription_type: insertData.subcription_type,
        descriptionId: insertData.descriptionId,
        rate: insertData.rate,
        user: insertData.user,
        total_amount: insertData.total_amount,
        discount: insertData.discount,
        final_amount: insertData.final_amount,
        ...taxFields,
        license_start_date,
        license_end_date,
        extended_license_date: extendExpiryDate,
        validate_for: insertData.validate_for,
        calendar_days: insertData.calendar_days,
      };

      const result = await Quotation.create(quotationData);

      if (result) {
        return result;
      } else {
        return this.handleError(Constants.FAIL_CODE, i18next.t('VALID_DATA'));
      }
    } catch (error: any) {
      return this.handleServerError(error);
    }
  };

  private async getNextQuotationNo() {
    const quotationNo = await Quotation.findOne({
      where: { quotation_no: { [Op.like]: `%TSK%` } },
      order: [['id', 'DESC']],
    });

    if (quotationNo === null) {
      return 'TSK00001';
    } else {
      const lastQuotationNo = quotationNo.quotation_no;
      const numericPart = parseInt(lastQuotationNo.substr(3), 10);
      const counter = isNaN(numericPart) ? 1 : numericPart + 1;
      return `TSK${counter.toString().padStart(5, '0')}`;
    }
  }

  private async getStateDataAndTaxFields(insertData: any) {
    const customerAddress = await Customer.findOne({ where: { id: insertData.customerId } });
    const stateData = await State.findOne({ where: { name: customerAddress.state } });

    const taxFields = {
      CGST: insertData.CGST,
      SGST: insertData.SGST,
      IGST: insertData.IGST,
      rounding_off: insertData.rounding_off,
      receivable_amount: insertData.receivable_amount,
    };

    return { stateData, taxFields };
  }

  private validateTaxFields(insertData: any, stateData: any) {
    if (stateData.no === 24) {
      return insertData.CGST && insertData.SGST;
    } else {
      return insertData.IGST;
    }
  }

  public calculateLicenseDates = async (insertData: any) => {
    const license_start_date = moment().format('YYYY-MM-DD');
    const SubcriptionPlantype = await SubcriptionPlan.findOne({ where: { id: insertData.subcriptionPlanId } });
    const license_end_date = utils.setExpireDate(license_start_date, SubcriptionPlantype.type);
    let extendExpiryDate;

    if (insertData.subcription_type === 'Monthly') {
      extendExpiryDate = moment(license_end_date).add(7, 'days').format('YYYY-MM-DD');
    } else {
      extendExpiryDate = moment(license_end_date).add(15, 'days').format('YYYY-MM-DD');
    }

    return { license_start_date, license_end_date, extendExpiryDate };
  };

  private handleError(statusCode: number, message: string) {
    return {
      statusCode,
      message,
    };
  }

  private handleServerError(error: any) {
    return {
      statusCode: Constants.INTERNAL_SERVER_ERROR_CODE,
      data: {
        statusCode: Constants.INTERNAL_SERVER_ERROR_CODE,
        error: error.toString(),
        message: i18next.t('ERR_INTERNAL_SERVER'),
      },
    };
  }

  public quotationDatagetAll = async (reqQuery: any) => {
    try {
      let whereForEmail = {};
      const page = parseInt(reqQuery?.page) || 1;
      const limit = parseInt(reqQuery?.limit) || 10;

      const offset = limit * (page - 1);
      const email = reqQuery?.email;
      if (email) {
        whereForEmail = {
          email: email,
        };
      }
      return new Promise((resolve, reject) => {
        Quotation.findAndCountAll({
          include: [
            {
              model: Description,
            },
            {
              model: Customer,
              where: whereForEmail,
            },
            {
              model: SubcriptionPlan,
            },
          ],
          limit: limit,
          offset: offset,
          order: [['id', 'DESC']],
        })
          .then((quotation: any) => {
            const pages = Math.ceil(quotation?.count / limit);
            let result: any = { result: quotation?.rows, count: quotation?.count, pages: pages };
            if (email && !quotation?.rows?.length) {
              result = {
                statusCode: Constants.FAIL_CODE,
                message: i18next.t('NOT_FOUND'),
              };
            }
            resolve(result);
          })
          .catch((error: any) => {
            const result = {
              statusCode: Constants.FAIL_CODE,
              message: i18next.t(error, 'NOT_FOUND'),
            };
            reject(result);
          });
      });
    } catch (error: any) {
      return {
        statusCode: Constants.INTERNAL_SERVER_ERROR_CODE,
        data: {
          statusCode: Constants.INTERNAL_SERVER_ERROR_CODE,
          error: error.toString(),
          message: i18next.t('ERR_INTERNAL_SERVER'),
        },
      };
    }
  };

  public quotationDatafindById = async (id: any) => {
    try {
      const result = await Quotation.findByPk(id, {
        include: [
          {
            model: Description,
          },
          {
            model: Customer,
          },
          {
            model: SubcriptionPlan,
          },
        ],
      });
      if (result) {
        return result;
      } else {
        return {
          statusCode: Constants.FAIL_CODE,
          message: i18next.t('NOT_FOUND'),
        };
      }
    } catch (error: any) {
      return {
        statusCode: Constants.INTERNAL_SERVER_ERROR_CODE,
        data: {
          statusCode: Constants.INTERNAL_SERVER_ERROR_CODE,
          error: error.toString(),
          message: i18next.t('ERR_INTERNAL_SERVER'),
        },
      };
    }
  };

  public quotationDataupdate = async (id: any, insertData: any) => {
    try {
      const history = await Quotation.findOne({ where: { id: id } });

      const historyData = {
        quotation_no: history.quotation_no,
        date: history.date,
        customer_name: history.customer_name,
        subcription_type: history.subcription_type,
        plan: history.plan,
        rate: history.rate,
        user: history.user,
        total_amount: history.total_amount,
        discount: history.discount,
        final_amount: history.final_amount,
        CGST: history.CGST,
        SGST: history.SGST,
        IGST: history.IGST,
        rounding_off: history.rounding_off,
        receivable_amount: history.receivable_amount,
        customerId: history.customerId,
        subcriptionPlanId: history.subcriptionPlanId,
        descriptionId: history.descriptionId,
        license_start_date: history.license_start_date,
        license_end_date: history.license_end_date,
        extended_license_date: history.extendExpiryDate,
        validate_for: history.validate_for,
        calendar_days: history.calendar_days,
      };
      const result = await Quotation.update(insertData, { where: { id: id } });
      await QuotationHistory.create(historyData);
      if (result) {
        return result;
      } else {
        return {
          statusCode: Constants.FAIL_CODE,
          message: i18next.t('NOT_FOUND'),
        };
      }
    } catch (error: any) {
      return {
        statusCode: Constants.INTERNAL_SERVER_ERROR_CODE,
        data: {
          statusCode: Constants.INTERNAL_SERVER_ERROR_CODE,
          error: error.toString(),
          message: i18next.t('ERR_INTERNAL_SERVER'),
        },
      };
    }
  };

  public quotationDataDelete = async (id: any) => {
    try {
      const result = await Quotation.destroy({ where: { id: id } });
      if (result) {
        return result;
      } else {
        return {
          statusCode: Constants.FAIL_CODE,
          message: i18next.t('NOT_FOUND'),
        };
      }
    } catch (error: any) {
      return {
        statusCode: 500,
        data: {
          statusCode: Constants.INTERNAL_SERVER_ERROR_CODE,
          error: error.toString(),
          message: i18next.t('ERR_INTERNAL_SERVER'),
        },
      };
    }
  };

  public quotationToinvoice = async (id: any) => {
    try {
      const checkData = await Quotation.findByPk(id);
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      let financialYear;
      if (currentMonth >= 4) {
        financialYear = `${currentYear}-${currentYear + 1}`;
      } else {
        financialYear = `${currentYear - 1}-${currentYear}`;
      }
      const bill = await BillSeries.findOne({ where: { series: { [Op.like]: `%${financialYear}%` } } });
      const invoiceNo = await InvoiceData.findOne({
        where: { invoice_no: { [Op.like]: `%${financialYear}%` } },
        order: [['id', 'DESC']],
      });
      let counter: any;
      if (invoiceNo === null) {
        counter = 1;
      } else {
        counter = Number(invoiceNo.invoice_no.split('/')[2]) + 1;
      }
      function generateNextString() {
        const newStr = bill.series + '/' + counter.toString().padStart(4, '0');
        counter++;
        return newStr;
      }
      const data = {
        invoice_no: generateNextString(),
        date: checkData.date,
        subcription_type: checkData.subcription_type,
        rate: checkData.rate,
        user: checkData.user,
        total_amount: checkData.total_amount,
        discount: checkData.discount,
        final_amount: checkData.final_amount,
        CGST: checkData.CGST,
        SGST: checkData.SGST,
        IGST: checkData.IGST,
        rounding_off: checkData.rounding_off,
        receivable_amount: checkData.receivable_amount,
        customerId: checkData.customerId,
        subcriptionPlanId: checkData.subcriptionPlanId,
        descriptionId: checkData.descriptionId,
        license_start_date: checkData.license_start_date,
        license_end_date: checkData.license_end_date,
        extended_license_date: checkData.extended_license_date,
        // validate: checkData.validate,
        // calendar_days: checkData.calendar_days,
      };
      const result = await InvoiceData.create(data);
      if (result) {
        return result;
      } else {
        return {
          statusCode: Constants.FAIL_CODE,
          message: i18next.t('VALID_DATA'),
        };
      }
    } catch (error: any) {
      return {
        statusCode: Constants.INTERNAL_SERVER_ERROR_CODE,
        data: {
          statusCode: Constants.INTERNAL_SERVER_ERROR_CODE,
          error: error.toString(),
          message: i18next.t('ERR_INTERNAL_SERVER'),
        },
      };
    }
  };

  public quotationHistoryGetall = async (reqQuery: any) => {
    try {
      const page = parseInt(reqQuery?.page) || 1;
      const limit = parseInt(reqQuery?.limit) || Constants.DATA_LIMIT;
      const offset = limit * (page - 1);
      let whereForEmail = {};
      const email = reqQuery?.email;
      if (email?.length) {
        whereForEmail = {
          email: email,
        };
      }

      const result = await QuotationHistory.findAndCountAll({
        include: [
          {
            model: Description,
          },
          {
            model: Customer,
            where: whereForEmail,
          },
          {
            model: SubcriptionPlan,
          },
        ],
        limit: limit,
        offset: offset,
        order: [['id', 'DESC']], // Sort by id in descending order
      });

      if (result) {
        const pages = Math.ceil(result.count / limit);
        return { result: result?.rows, count: result.count, pages: pages };
      } else {
        return {
          statusCode: Constants.FAIL_CODE,
          message: i18next.t('NOT_FOUND'),
        };
      }
    } catch (error: any) {
      return {
        statusCode: Constants.INTERNAL_SERVER_ERROR_CODE,
        data: {
          statusCode: Constants.INTERNAL_SERVER_ERROR_CODE,
          error: error.toString(),
          message: i18next.t('ERR_INTERNAL_SERVER'),
        },
      };
    }
  };

  public quotationHistoryfindById = async (id: any) => {
    try {
      const result = await QuotationHistory.findByPk(id, {
        include: [
          {
            model: Description,
          },
          {
            model: Customer,
          },
          {
            model: SubcriptionPlan,
          },
        ],
      });
      if (result) {
        return result;
      } else {
        return {
          statusCode: Constants.FAIL_CODE,
          message: i18next.t('NOT_FOUND'),
        };
      }
    } catch (error: any) {
      return {
        statusCode: Constants.INTERNAL_SERVER_ERROR_CODE,
        data: {
          statusCode: Constants.INTERNAL_SERVER_ERROR_CODE,
          error: error.toString(),
          message: i18next.t('ERR_INTERNAL_SERVER'),
        },
      };
    }
  };

  public quotationDataTopdf = async (id: any) => {
    try {
      const result = await Quotation.findByPk(id, {
        include: [
          {
            model: Description,
          },
          {
            model: Customer,
          },
          {
            model: SubcriptionPlan,
          },
        ],
      });
      if (result) {
        const start_date = moment(result.license_start_date).format('DD/MM/YYYY');
        const end_date = moment(result.license_start_date).format('DD/MM/YYYY');
        const amount = result.total_amount - (result.total_amount * result.discount) / 100;
        const amountWord = converter.toWords(result.receivable_amount);
        const templatePath = path.resolve(__dirname, '../../../templates/invoice-pdf/quotationData.ejs');
        if (fs.existsSync(templatePath)) {
          // File exists, proceed with reading
          const template = fs.readFileSync(templatePath, 'utf8');
          // Rest of the code
          const renderedHtml = ejs.render(template, { result, amountWord, amount, start_date, end_date });
          const filePath = path?.join(`${__dirname}/../../../../uploads/pdf`, `${result.customer.company_name}.pdf`);
          const options: any = {
            format: 'A3',
            orientation: 'portrait',
            height: '12in',
            width: '18in',
            type: 'pdf',
            quality: '75',
          };

          pdf.create(renderedHtml, options).toFile(filePath, (error, _result) => {
            if (error) {
              return {
                statusCode: Constants.FAIL_CODE,
                message: i18next.t('PDF_FAIL'),
              };
            }
          });
          return `/uploads/pdf/${result.customer.company_name}.pdf`;
        } else {
          console.error('Template file does not exist:', templatePath);
        }
      } else {
        return {
          statusCode: Constants.FAIL_CODE,
          message: i18next.t('NOT_FOUND'),
        };
      }
    } catch (error: any) {
      return {
        statusCode: Constants.INTERNAL_SERVER_ERROR_CODE,
        data: {
          statusCode: Constants.INTERNAL_SERVER_ERROR_CODE,
          error: error.toString(),
          message: i18next.t('ERR_INTERNAL_SERVER'),
        },
      };
    }
  };

  public quotationPdfsentEmail = async (id: any) => {
    try {
      const transport = await sendMail.sendMailSmtp();
      const result = await Quotation.findByPk(id, {
        include: [
          {
            model: Description,
          },
          {
            model: Customer,
          },
          {
            model: SubcriptionPlan,
          },
        ],
      });
      if (result) {
        const start_date = moment(result.license_start_date).format('DD/MM/YYYY');
        const end_date = moment(result.license_start_date).format('DD/MM/YYYY');
        const amount = result.total_amount - (result.total_amount * result.discount) / 100;
        const amountWord = converter.toWords(result.receivable_amount);
        const templatePath = path.resolve(__dirname, '../../../templates/invoice-pdf/quotationData.ejs');
        if (fs.existsSync(templatePath)) {
          const template = fs.readFileSync(templatePath, 'utf8');
          const renderedHtml = ejs.render(template, { result, amountWord, amount, start_date, end_date });
          const filePath = path?.join(`${__dirname}/../../../../uploads/pdf`, `${result.customer.company_name}.pdf`);
          const options: any = {
            format: 'A3',
            orientation: 'portrait',
            height: '32in',
            width: '18in',
            type: 'pdf',
            quality: '75',
          };

          pdf.create(renderedHtml, options).toFile(filePath, (error, _resultPdf) => {
            if (error) {
              return {
                statusCode: Constants.FAIL_CODE,
                message: i18next.t('PDF_FAIL'),
              };
            } else {
              const pathDir = path.resolve(__dirname, '../../../templates/quotationPDFMail.ejs');
              ejs.renderFile(pathDir, { result: result }, (_err, data) => {
                const mailOptions: any = {
                  from: process.env.From,
                  to: result.customer.email,
                  subject: `Quotation :-` + result.quotation_no,
                  html: data,
                  attachments: [
                    {
                      filename: `${result.customer.company_name}.pdf`,
                      path: `${filePath}`,
                    },
                  ],
                };
                transport.sendMail(mailOptions, (mailError: any, info: { response: string }) => {
                  return this.quotationPdfResponse(info, mailError);
                });
              });
            }
          });
          return {
            CompanyName: result.customer.company_name,
            Email: result.customer.email,
          };
        } else {
          console.error('Template file does not exist:', templatePath);
        }
      } else {
        return {
          statusCode: Constants.FAIL_CODE,
          message: i18next.t('NOT_FOUND'),
        };
      }
    } catch (error: any) {
      return {
        statusCode: Constants.INTERNAL_SERVER_ERROR_CODE,
        data: {
          statusCode: Constants.INTERNAL_SERVER_ERROR_CODE,
          error: error.toString(),
          message: i18next.t('ERR_INTERNAL_SERVER'),
        },
      };
    }
  };

  public quotationPdfResponse = (info: any, error: any) => {
    if (error) {
      return error;
    } else {
      return 'Email sent successfully: ' + info.response;
    }
  };
}

export default QuotationUtils;
