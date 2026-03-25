/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as dotenv from 'dotenv';
import db from '../../../database/db';
import ResponseBuilder from '../../../helpers/responseBuilder';
import i18next from 'i18next';
import { Constants } from '../../../../config/constants';
import * as pdf from 'html-pdf';
import fs from 'fs';
import ejs from 'ejs';
import moment from 'moment';
import path from 'path';
import utils from '../../../helpers/utils';
import converter from 'number-to-words';
import sendEmail from '../../../helpers/sendEmail';
import { Op } from 'sequelize';
import AWS from 'aws-sdk';
const sendMail = new sendEmail();

dotenv.config();

const InvoiceData = db.invoice_data;
const Customer = db.customer;
const State = db.state;
const SubcriptionPlan = db.subcription_plan;
const Description = db.description;

class InvoiceDataUtils {
  public async invoiceDataAdd(insertData: any) {
    try {
      const { financialYear } = utils.calculateFinancialYear();
      const customerAddress = await Customer.findOne({ where: { id: insertData.customerId } });
      const stateData = await State.findOne({ where: { name: customerAddress.state } });
      const invoiceDate = moment(insertData?.invoiceDate);
      const license_start_date = moment().format('YYYY-MM-DD');
      const license_end_date = this.calculateLicenseEndDate(license_start_date, insertData.subcription_type);
      const extendExpiryDate = this.calculateExtendExpiryDate(license_end_date, insertData.subcriptionPlanId);
      if (stateData === null) {
        return {
          statusCode: Constants.FAIL_CODE,
          message: i18next.t('VALID_STATE'),
        };
      }
      if (stateData.no === 24) {
        if (!insertData?.CGST) {
          return this.generateFailureResponse(i18next.t('CGST'));
        }
        if (!insertData?.SGST) {
          return this.generateFailureResponse(i18next.t('SGST'));
        }
      } else if (stateData.no !== 24) {
        if (!insertData?.IGST) {
          return this.generateFailureResponse(i18next.t('IGST'));
        }
      }

      const totalAmount = insertData?.rate * insertData?.user * insertData?.planDuration;
      const total = totalAmount - totalAmount * (insertData.discount / 100);

      if (total?.toFixed(2) !== insertData?.final_amount?.toFixed(2)) {
        return this.generateFailureResponse(i18next.t('FINAL_AMOUNT_MISMATCH'));
      }

      const data = {
        invoice_no: await utils.generateNextString(financialYear, insertData),
        invoice_date: invoiceDate,
        customer_name: insertData.customer_name,
        subcription_type: insertData.subcription_type,
        descriptionId: insertData.descriptionId,
        rate: insertData.rate,
        user: insertData.user,
        total_amount: insertData.total_amount,
        discount: insertData.discount,
        final_amount: insertData.final_amount,
        CGST: insertData.CGST,
        SGST: insertData.SGST,
        IGST: insertData.IGST,
        rounding_off: insertData.rounding_off,
        receivable_amount: insertData.receivable_amount,
        customerId: insertData.customerId,
        subcriptionPlanId: insertData.subcriptionPlanId,
        license_start_date,
        license_end_date,
        extended_license_date: extendExpiryDate,
        invoiceType: insertData?.invoiceType || Constants.INVOICE_TYPE.TAX,
        planDuration: insertData?.planDuration,
      };

      const result = await InvoiceData.create(data);

      if (result) {
        this.invoiceDataTopdf(result?.id);
        return result;
      } else {
        return this.generateFailureResponse(i18next.t('VALID_DATA'));
      }
    } catch (error: any) {
      return this.generateErrorResponse(error.toString());
    }
  }

  private calculateLicenseEndDate(license_start_date: string, subcription_type: string) {
    const endDateModifier = subcription_type === 'Monthly' ? 7 : 15;
    return moment(license_start_date).add(endDateModifier, 'days').format('YYYY-MM-DD');
  }

  private calculateExtendExpiryDate(license_end_date: string, subcriptionPlanId: any) {
    const endDateModifier = subcriptionPlanId.type === 'Monthly' ? 7 : 15;
    return moment(license_end_date).add(endDateModifier, 'days').format('YYYY-MM-DD');
  }

  private generateFailureResponse(message: string) {
    return {
      statusCode: Constants.FAIL_CODE,
      message,
    };
  }

  private generateErrorResponse(error: string) {
    return {
      statusCode: Constants.INTERNAL_SERVER_ERROR_CODE,
      data: {
        statusCode: Constants.INTERNAL_SERVER_ERROR_CODE,
        error,
        message: i18next.t('ERR_INTERNAL_SERVER'),
      },
    };
  }

  public invoiceDatagetAll = async (reqQuery: any) => {
    try {
      const page = parseInt(reqQuery?.page) || 1;
      const limit = parseInt(reqQuery?.limit) || Constants.DATA_LIMIT; // number of records per page
      const { search, plan, startDate, endDate } = reqQuery;
      let where: any = {};
      let whereForSubscription = {};

      if (reqQuery?.invoiceType) {
        where = {
          invoiceType: reqQuery?.invoiceType,
        };
        if (reqQuery?.invoiceType === Constants.INVOICE_TYPE.TAX && reqQuery?.linkedInvoice === 'true') {
          where['linkedInvoiceNo'] = null;
        }
      }

      if (plan && plan !== 'all') {
        whereForSubscription = {
          type: {
            [Op.eq]: plan,
          },
        };
      }

      if (startDate && endDate) {
        where[Op.or] = [
          {
            license_start_date: {
              [Op.between]: [startDate, endDate],
            },
          },
          {
            license_end_date: {
              [Op.between]: [startDate, endDate],
            },
          },
        ];
      }

      if (search) {
        where[Op.or] = [
          {
            invoice_no: {
              [Op.like]: `%${search}%`,
            },
          },
          {
            '$customer.email$': {
              [Op.like]: `%${search}%`,
            },
          },
          {
            '$customer.company_name$': {
              [Op.like]: `%${search}%`,
            },
          },
        ];
      }

      const offset = limit * (page - 1);
      return new Promise((resolve, reject) => {
        InvoiceData.findAndCountAll({
          include: [
            {
              model: Description,
            },
            {
              model: Customer,
              as: 'customer',
            },
            {
              model: SubcriptionPlan,
              where: whereForSubscription,
            },
          ],
          limit: limit,
          offset: offset,
          where,
          order: [['id', 'DESC']],
        })
          .then((invoice: any) => {
            const pages = Math.ceil(invoice.count / limit);
            const result = { result: invoice?.rows, count: invoice.count, pages: pages };
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

  public invoiceDatafindById = async (id: any) => {
    try {
      const result = await InvoiceData.findByPk(id, {
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
        statusCode: 500,
        data: {
          statusCode: Constants.INTERNAL_SERVER_ERROR_CODE,
          error: error.toString(),
          message: i18next.t('ERR_INTERNAL_SERVER'),
        },
      };
    }
  };

  public invoiceDataupdate = async (id: any, insertData: any) => {
    try {
      const result = await InvoiceData.update(insertData, { where: { id: id } });
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

  public invoiceDataDelete = async (id: any) => {
    try {
      const result = await InvoiceData.destroy({ where: { id: id } });
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

  public invoiceDataTopdf = async (id: any) => {
    try {
      const result = await InvoiceData.findByPk(id, {
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
        const end_date = moment(result.license_end_date).format('DD/MM/YYYY');
        const amount = result.total_amount - (result.total_amount * result.discount) / 100;
        const amountWord = converter.toWords(result.receivable_amount);
        const templatePath = path.resolve(__dirname, '../../../templates/invoice-pdf/invoice.ejs');
        const stateData = await State.findOne({ where: { name: result.customer?.state } });
        const isoCode = stateData.isoCode;
        if (fs.existsSync(templatePath)) {
          // File exists, proceed with reading
          const template = fs.readFileSync(templatePath, 'utf8');
          // Rest of the code
          const renderedHtml = ejs.render(template, { result, amountWord, amount, start_date, end_date, isoCode });
          const filePath = path?.join(`${__dirname}/../../../../uploads/pdf`, `${result.customer.company_name}.pdf`);
          const options: any = {
            format: 'A4',
            orientation: 'portrait',
            height: '20in',
            width: '18in',
            type: 'pdf',
            quality: '100',
          };
          pdf.create(renderedHtml, options).toFile(filePath, async (error, _result) => {
            if (error) {
              return {
                statusCode: Constants.FAIL_CODE,
                message: i18next.t('PDF_FAIL'),
              };
            } else {
              const pdfUrl: any = await this.uploadToS3(
                filePath,
                `uploads/pdf/${result.customer.company_name}__${moment().format('YYYY-MM-DD_(HH:mm:ss)')}.pdf`,
              );
              InvoiceData.update(
                { pdfLink: pdfUrl },
                {
                  where: {
                    id: id,
                  },
                },
              );
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
        statusCode: 500,
        data: {
          statusCode: Constants.INTERNAL_SERVER_ERROR_CODE,
          error: error.toString(),
          message: i18next.t('ERR_INTERNAL_SERVER'),
        },
      };
    }
  };

  public uploadToS3 = async (filePath: fs.PathLike, fileName: string) => {
    try {
      AWS.config.update({
        accessKeyId: process.env.S3_BUCKET_ACCESSKEYID,
        secretAccessKey: process.env.S3_BUCKET_SECRETACCESSKEY,
        region: process.env.AWS_REGION,
      });

      const s3 = new AWS.S3();

      const params: any = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileName,
        Body: fs.createReadStream(filePath),
        ACL: 'public-read',
      };

      const s3Response = await s3.upload(params).promise();
      return s3Response?.Location;
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      return {
        statusCode: 500,
        data: {
          statusCode: Constants.INTERNAL_SERVER_ERROR_CODE,
          error: error,
          message: i18next.t('ERR_INTERNAL_SERVER'),
        },
      };
    }
  };

  public invoicePdfsentEmail = async (id: any) => {
    try {
      const transport = await sendMail.sendMailSmtp();
      const result = await InvoiceData.findByPk(id, {
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
        const templatePath = path.resolve(__dirname, '../../../templates/invoice-pdf/invoice.ejs');
        if (fs.existsSync(templatePath)) {
          const template = fs.readFileSync(templatePath, 'utf8');
          const renderedHtml = ejs.render(template, { result, amountWord, amount, start_date, end_date });
          const filePath = path?.join(`${__dirname}/../../../../uploads/pdf`, `${result.customer.company_name}.pdf`);
          const options: any = {
            format: 'A4',
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
              const pathDir = path.resolve(__dirname, '../../../templates/invoicePDFMail.ejs');
              ejs.renderFile(pathDir, { result: result }, (_err, data) => {
                const mailOptions: any = {
                  from: process.env.From,
                  to: result.customer.email,
                  subject: `Invoice :-` + result.invoice_no,
                  html: data,
                  attachments: [
                    {
                      filename: `${result.customer.company_name}.pdf`,
                      path: `${filePath}`,
                    },
                  ],
                };
                transport.sendMail(mailOptions, (mailError: any, info: { response: string }) => {
                  return this.invoicePdfResponse(info, mailError);
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

  public invoicePdfResponse = (info: any, error: any) => {
    if (error) {
      return error;
    } else {
      return 'Email sent successfully: ' + info.response;
    }
  };

  public invoiceLostClient = async () => {
    try {
      const todayDate = moment().format('YYYY-MM-DD');
      const result = InvoiceData.update({ subcription_type: `Expired` }, { where: { license_end_date: todayDate } });
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

  public findCustomerInvoice = async (reqQuery: any) => {
    try {
      const page = parseInt(reqQuery?.page) || 1;
      const limit = parseInt(reqQuery?.limit) || 10;

      const offset = limit * (page - 1);
      const result = await InvoiceData.findAndCountAll({
        include: [
          {
            model: SubcriptionPlan,
            attributes: Constants.TABLE_ATTRIBUTES.SUBSCRIPTION_PLAN_ATTRIBUTES,
          },
        ],
        where: {
          customerId: await utils.getCustomerId(reqQuery?.email),
        },
        offset: offset,
        limit: limit,
      });
      if (result) {
        const count = result?.count;
        return {
          pages: Math.ceil(count / limit),
          result,
        };
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
}

export default InvoiceDataUtils;
