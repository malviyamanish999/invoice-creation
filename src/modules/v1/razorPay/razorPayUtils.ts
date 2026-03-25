/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as dotenv from 'dotenv';
import { Op } from 'sequelize';
import db from '../../../database/db';
import ResponseBuilder from '../../../helpers/responseBuilder';
import i18next from 'i18next';
import { Constants } from '../../../../config/constants';
import ejs from 'ejs';
import sendEmail from '../../../helpers/sendEmail';
import moment from 'moment';
import path from 'path';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { Log } from '../../../helpers/logger';
dotenv.config();
const sendMail = new sendEmail();

const InvoiceData = db.invoice_data;
const Customer = db.customer;
const SubcriptionPlan = db.subcription_plan;
const Quotation = db.quotation;
const Description = db.description;
const paymentRecord = db.payment_record;
const BillSeries = db.bill_series;

class RazorPayUtils {
  private logger = Log.getLogger();

  public invoicePayment = async (id: any) => {
    try {
      const result = await InvoiceData.findByPk(id);
      if (result) {
        if (process.env.KEY_ID && process.env.KEY_SECRET) {
          const instance = new Razorpay({
            key_id: process.env.KEY_ID,
            key_secret: process.env.KEY_SECRET,
          });
          const options = {
            amount: result.final_amount * 100,
            currency: 'INR',
            receipt: crypto.randomBytes(10).toString('hex'),
          };

          // Wrap the asynchronous operation in a promise
          const createOrder = () => {
            return new Promise((resolve, reject) => {
              instance.orders.create(options, (error, orderDetails) => {
                this.invoicePaymentResponse(resolve, reject, error, orderDetails);
              });
            });
          };
          try {
            const orderDetails = await createOrder(); // Wait for the promise to resolve
            return [orderDetails]; // Add the orderDetails to the order array
          } catch (error) {
            return error;
          }
        } else {
          console.error('Missing environment variables: KEY_ID or KEY_SECRET');
        }
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

  public invoicePaymentResponse = (resolve: any, reject: any, error: any, orderDetails: any) => {
    if (error) {
      const result = {
        statusCode: Constants.FAIL_CODE,
        error: error,
        message: i18next.t('NOT_FOUND'),
      };
      reject(result);
    } else {
      resolve(orderDetails);
    }
  };

  public verifyPayment = async (body: any) => {
    try {
      const sign = body.razorpay_order_id + '|' + body.razorpay_payment_id;
      const expectedSign = crypto
        .createHmac('sha256', process.env.KEY_SECRET ?? '')
        .update(sign.toString())
        .digest('hex');

      if (body.razorpay_signature === expectedSign) {
        return ResponseBuilder.successMessage(i18next.t('Payment verified successfully'));
      } else {
        return ResponseBuilder.successMessage(i18next.t('Invalid signature sent!'));
      }
    } catch (error) {
      return ResponseBuilder.errorMessage(error, i18next.t('ERR_INTERNAL_SERVER'));
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
    } catch (error) {
      return ResponseBuilder.errorMessage(error, i18next.t('ERR_INTERNAL_SERVER'));
    }
  };

  public paymentLink = async (invoice_no: any) => {
    try {
      const result = await InvoiceData.findOne({
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
        where: { invoice_no: invoice_no },
      });
      if (result) {
        if (process.env.KEY_ID && process.env.KEY_SECRET) {
          const instance = new Razorpay({
            key_id: process.env.KEY_ID,
            key_secret: process.env.KEY_SECRET,
          });
          const test: any = await instance.paymentLink.create({
            amount: result.receivable_amount * 100,
            currency: 'INR',
            accept_partial: true,
            first_min_partial_amount: 100,
            description: `Payment for invoice No :-` + result.invoice_no,
            // expire_by: 1691097057,
            customer: {
              name: result.customer.company_name,
              email: result.customer.email,
              contact: result.customer.mobile_no,
            },
            notify: {
              sms: true,
              email: false,
            },
            reminder_enable: true,
            notes: {
              policy_name: 'TaskOPad',
            },
            callback_url: process.env.CALL_BACK_URL,
            callback_method: 'get',
          });
          const pathDir = path.resolve(__dirname, '../../../templates/invoicePaymentLink.ejs');
          ejs.renderFile(pathDir, { test: test }, (err, data) => {
            return this.subscriptionLinkResponse(result, data, Constants.EMAIL_MESSAGES.INVOICE, err);
          });
          if (test) {
            const date = moment().format('YYYY-MM-DD');
            const data = {
              customer_name: test.customer.name,
              bill_no: result.invoice_no,
              bill_amount: result.receivable_amount,
              payment_gateway: `razorPay`,
              payment_date: date,
              subcription_endDate: result.license_end_date,
              razorpay_payment_link_id: test.id,
              status: test.status,
              subcription_startDate: result.license_start_date,
            };
            const recordExist = await paymentRecord.findAll({ where: { bill_no: result.invoice_no } });
            if (recordExist.length === 0) {
              await paymentRecord.create(data);
            }
            return test;
          } else if (!test) {
            return {
              statusCode: Constants.INTERNAL_SERVER_ERROR_CODE,
              message: i18next.t('ERR_INTERNAL_SERVER'),
            };
          }
        }
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

  public paymentLinkQuotation = async (quotation_no: any) => {
    try {
      const result = await Quotation.findOne({
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
        where: { quotation_no: quotation_no },
      });
      if (result) {
        if (process.env.KEY_ID && process.env.KEY_SECRET) {
          const instance = new Razorpay({
            key_id: process.env.KEY_ID,
            key_secret: process.env.KEY_SECRET,
          });
          const test: any = await instance.paymentLink.create({
            amount: result.receivable_amount * 100,
            currency: 'INR',
            accept_partial: true,
            first_min_partial_amount: 100,
            description: `Payment for Quotation No :-` + result.quotation_no,
            customer: {
              name: result.customer.company_name,
              email: result.customer.email,
              contact: result.customer.mobile_no,
            },
            notify: {
              sms: true,
              email: false,
            },
            reminder_enable: true,
            notes: {
              policy_name: 'TaskOPad',
            },
            callback_url: process.env.CALL_BACK_URL,
            callback_method: 'get',
          });

          const pathDir = path.resolve(__dirname, '../../../templates/quotationPaymentLink.ejs');
          ejs.renderFile(pathDir, { test: test }, (err, data) => {
            return this.subscriptionLinkResponse(result, data, Constants.EMAIL_MESSAGES.QUOTATION, err);
          });

          if (test) {
            /*  Quotation to Invoice   */

            await this.quotationToinvoice(result.id);

            /* Quotation payment record store in payment record*/
            const date = moment().format('YYYY-MM-DD');
            const data = {
              customer_name: test.customer.name,
              bill_no: result.quotation_no,
              bill_amount: result.receivable_amount,
              payment_gateway: `razorPay`,
              payment_date: date,
              subcription_endDate: result.license_end_date,
              razorpay_payment_link_id: test.id,
              status: test.status,
              subcription_startDate: result.license_start_date,
              // subcription_type: result.subcription_plan.type,
              // description: result.description.description,
              // plan: result.subcription_type,
              // rate: result.rate,
              // user: result.user,
            };
            const recordExist = await paymentRecord.findAll({ where: { bill_no: result.quotation_no } });
            if (recordExist.length === 0) {
              await paymentRecord.create(data);
            }
            return test;
          } else if (!test) {
            return {
              statusCode: Constants.INTERNAL_SERVER_ERROR_CODE,
              message: i18next.t('ERR_INTERNAL_SERVER'),
            };
          }
        }
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

  public paymentnNotifyBy = async (paymentLinkId: any, medium: any) => {
    try {
      if (process.env.KEY_ID && process.env.KEY_SECRET) {
        const instance = new Razorpay({
          key_id: process.env.KEY_ID,
          key_secret: process.env.KEY_SECRET,
        });
        instance.paymentLink.notifyBy(paymentLinkId, medium);
      } else {
        console.error('Missing environment variables: KEY_ID or KEY_SECRET');
      }
    } catch (error) {
      return ResponseBuilder.errorMessage(error, i18next.t('ERR_INTERNAL_SERVER'));
    }
  };

  public paymentFetchByID = async (paymentData: any) => {
    try {
      if (process.env.KEY_ID && process.env.KEY_SECRET) {
        const instance = new Razorpay({
          key_id: process.env.KEY_ID,
          key_secret: process.env.KEY_SECRET,
          headers: { 'Content-Type': 'application/json' },
        });
        const createOrder = () => {
          return new Promise((resolve, reject) => {
            instance.paymentLink.fetch(paymentData.razorpay_payment_link_id, (error, orderDetails) => {
              if (error) {
                const response = {
                  statusCode: Constants.FAIL_CODE,
                  error: error,
                  message: i18next.t('NOT_FOUND'),
                };
                reject(response);
              } else {
                resolve(orderDetails);
              }
            });
          });
        };
        try {
          const orderDetails = await createOrder(); // Wait for the promise to resolve
          const order: any = [orderDetails]; // Add the orderDetails to the order array
          const checkRecord = await paymentRecord.findOne({
            where: { razorpay_payment_link_id: paymentData.razorpay_payment_link_id },
          });
          const data = {
            payment_received: order[0].amount_paid / 100,
            razorpay_payment_id: order[0].payments.payment_id,
            razorpay_signature: paymentData.razorpay_signature,
            razorpay_order_id: order[0].order_id,
            status: order[0].status,
            payment_difference: checkRecord.bill_amount - order[0].amount_paid / 100,
            total_out_standing: checkRecord.bill_amount - order[0].amount_paid / 100,
          };

          await paymentRecord.update(data, {
            where: { razorpay_payment_link_id: paymentData.razorpay_payment_link_id },
          });
          return order;
        } catch (error) {
          return error;
        }
      } else {
        console.error('Missing environment variables: KEY_ID or KEY_SECRET');
      }
      return true;
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

  public plansRazorpay = async () => {
    try {
      if (process.env.KEY_ID && process.env.KEY_SECRET) {
        const instance = new Razorpay({
          key_id: process.env.KEY_ID,
          key_secret: process.env.KEY_SECRET,
        });
        const data: any = [];
        const result: any = await instance.plans.all();
        const ids = result.items.map((item: any) => item.id);

        for (const iterator of ids) {
          const palns = await instance.plans.fetch(iterator);
          data.push(palns);
        }
        return data;
      } else {
        console.error('Missing environment variables: KEY_ID or KEY_SECRET');
      }
    } catch (error) {
      return ResponseBuilder.errorMessage(error, i18next.t('ERR_INTERNAL_SERVER'));
    }
  };

  public QuotationsubscriptionsLinkRazorpay = async (quotation_no: any) => {
    try {
      const result = await Quotation.findOne({
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
        where: { quotation_no: quotation_no },
      });
      if (result) {
        if (process.env.KEY_ID && process.env.KEY_SECRET) {
          const instance = new Razorpay({
            key_id: process.env.KEY_ID,
            key_secret: process.env.KEY_SECRET,
          });
          const plan = await instance.plans.create({
            period: 'monthly',
            interval: 1,
            item: {
              name: result.quotation_no,
              amount: result.receivable_amount * 100,
              currency: 'INR',
              description: 'quotation number to create subcription plan',
            },
          });
          const test: any = await instance.subscriptions.create({
            plan_id: plan.id,
            total_count: 1,
            quantity: 1,
            customer_notify: 1,
            addons: [
              {
                item: {
                  name: result.customer.company_name,
                  amount: result.receivable_amount,
                  currency: 'INR',
                },
              },
            ],
            notes: {
              notes_key_1: 'Subcription plan link',
            },
            notify_info: {
              notify_phone: result.customer.mobile_no,
              notify_email: result.customer.email,
            },
          });

          const pathDir = path.resolve(__dirname, '../../../templates/quotationPaymentLink.ejs');
          ejs.renderFile(pathDir, { test: test }, async (err, data) => {
            return this.subscriptionLinkResponse(result, data, Constants.EMAIL_MESSAGES.QUOTATION, err);
          });
        }
      }
    } catch (error) {
      return ResponseBuilder.errorMessage(i18next.t('ERR_INTERNAL_SERVER'));
    }
  };

  public subscriptionLinkResponse = async (result: any, data: any, msg: any, err: any) => {
    const transport = await sendMail.sendMailSmtp();
    if (err) {
      return err;
    } else {
      const mailOptions = {
        from: process.env.From,
        to: result.customer.email,
        subject: `${msg} ${result?.quotation_no || result?.invoice_no}`,
        html: data,
      };
      transport.sendMail(mailOptions, function (error: any, info: { response: string }) {
        if (error) {
          return error;
        } else {
          return 'Email sent successfully: ' + info.response;
        }
      });
    }
  };

  public InvoicesubscriptionsLinkRazorpay = async (invoice_no: any) => {
    try {
      const result = await InvoiceData.findOne({
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
        where: { invoice_no: invoice_no },
      });
      if (result) {
        if (process.env.KEY_ID && process.env.KEY_SECRET) {
          const instance = new Razorpay({
            key_id: process.env.KEY_ID,
            key_secret: process.env.KEY_SECRET,
          });
          const plan = await instance.plans.create({
            period: 'monthly',
            interval: 1,
            item: {
              name: result.invoice_no,
              amount: result.receivable_amount * 100,
              currency: 'INR',
              description: 'invoice number to create subcription plan',
            },
            // notes: {
            //   notes_key_1: 'Tea, Earl Grey, Hot',
            //   notes_key_2: 'Tea, Earl Grey… decaf.',
            // },
          });
          await instance.subscriptions.create({
            plan_id: plan.id,
            total_count: 1,
            quantity: 1,
            // expire_by: 1633237807,
            customer_notify: 1,
            addons: [
              {
                item: {
                  name: result.customer.company_name,
                  amount: result.receivable_amount,
                  currency: 'INR',
                },
              },
            ],
            notes: {
              notes_key_1: 'Subcription plan link',
            },
            notify_info: {
              notify_phone: result.customer.mobile_no,
              notify_email: result.customer.email,
            },
          });
        }
      }
    } catch (error) {
      return ResponseBuilder.errorMessage(i18next.t('ERR_INTERNAL_SERVER'));
    }
  };

  public webhookRazorpay = async (webhookData: any, signatureHeader: any) => {
    try {
      if (this.verifyWebhookSignature(webhookData, signatureHeader)) {
        // Signature is valid
        if (webhookData.event === Constants.WEBHOOK_EVENT.PAID) {
          const orderDetails = webhookData?.payload?.order;
          const paymentDetails = webhookData?.payload?.payment;
          const paymentLinkDetails = webhookData?.payload?.payment_link;
          const paymentId = paymentDetails?.entity?.id;

          this.logger.info(`payment successfull - paymentId: ${paymentId}`);
          const checkRecord = await paymentRecord.findOne({
            where: { razorpay_payment_link_id: paymentLinkDetails?.entity?.id },
          });

          const amount_paid = orderDetails?.entity?.amount_paid;

          const data = {
            payment_received: amount_paid / 100,
            razorpay_payment_id: paymentId,
            razorpay_signature: signatureHeader,
            razorpay_order_id: orderDetails?.entity?.id,
            status: orderDetails?.entity?.status,
            payment_difference: checkRecord.bill_amount - amount_paid / 100,
            total_out_standing: checkRecord.bill_amount - amount_paid / 100,
          };

          if (checkRecord) {
            await paymentRecord.update(data, {
              where: { razorpay_payment_link_id: paymentLinkDetails?.entity?.id },
            });
            return paymentId;
          } else {
            data['status'] = Constants.PAYMENT_RECORD.PAYMENT_STATUS;
            return paymentRecord.create(data);
          }
        } else if (webhookData.event === Constants.WEBHOOK_EVENT.AUTHORIZED) {
          const insertData = webhookData.payload?.payment?.entity;

          const data = {
            customer_name: `${webhookData?.first_name} ${webhookData?.last_name}`,
            bill_no: Constants.PAYMENT_TYPE.DIRECT,
            bill_amount: 0,
            payment_received: insertData?.amount / 100,
            payment_date: webhookData?.updatedAt,
            payment_gateway: 'razorPay',
            status:
              insertData.status === Constants.PAYMENT_RECORD.AUTHORISED
                ? Constants.PAYMENT_RECORD.PAYMENT_STATUS
                : Constants.PAYMENT_RECORD.PAYMENT_STATUS_UNPAID,
            razorpay_payment_id: insertData?.id,
            razorpay_order_id: insertData?.order_id,
            subcription_startDate: webhookData?.createdAt,
            subcription_endDate: webhookData?.updatedAt,
          };
          return paymentRecord.create(data);
        } else {
          this.logger.info('Payment Hook Fail');
          return ResponseBuilder.badRequest(i18next.t('PAYMENT_FAILURE'));
        }
      } else {
        return this.getWebhookResponse(webhookData);
      }
    } catch (error) {
      return ResponseBuilder.errorMessage(error, i18next.t('ERR_INTERNAL_SERVER'));
    }
  };

  public verifyWebhookSignature = (webhookData: any, signatureHeader: any) => {
    const expectedSignature = crypto
      .createHmac('sha256', process.env?.KEY_SECRET as string)
      .update(JSON.stringify(webhookData))
      .digest('hex');
    return webhookData?.manualTransaction ? true : signatureHeader === expectedSignature;
  };

  public getWebhookResponse = (webhookData: any) => {
    if (webhookData.event === Constants.WEBHOOK_EVENT.CAPTURED) {
      return ResponseBuilder.successMessage(i18next.t('PAYMENT_CAPTURED_WEBHOOK'));
    } else {
      this.logger.info('Payment Hook Fail');
      return ResponseBuilder.badRequest(i18next.t('PAYMENT_FAILURE'));
    }
  };
}

export default RazorPayUtils;
