import moment from 'moment';
import { Constants } from '../../config/constants';
import i18next from 'i18next';
import db from '../database/db';
import ResponseBuilder from './responseBuilder';
import sendEmail from '../helpers/sendEmail';
import ejs from 'ejs';
import path from 'path';
import { AxiosUtils } from './axios';
import { Op } from 'sequelize';

const sendMail = new sendEmail();
const InvoiceData = db.invoice_data;
const Customer = db.customer;
const SubcriptionPlan = db.subcription_plan;
const Description = db.description;
const BillSeries = db.bill_series;

export class Utils {
  public static getTodayDate = () => {
    return moment(new Date()).format(Constants.DEFAULT_TIME_FORMAT);
  };

  public static getCurrentMonth = () => {
    return moment(new Date()).format(Constants.MONTH_FORMAT);
  };

  public static getCurrentYear = () => {
    return moment(new Date()).format(Constants.YEAR_FORMAT);
  };

  public static getCurrentWeekStartDate = () => {
    return moment(new Date()).startOf('week').format(Constants.DATE_FORMAT);
  };

  public static getCurrentWeekEndDate = () => {
    return moment(new Date()).endOf('week').format(Constants.DATE_FORMAT);
  };

  public static getCurrentQuarterStart = () => {
    const data = moment(new Date()).quarter(moment().quarter()).startOf('quarter');
    console.log(data, '-----  datadatadatadatadata');
    return data;
  };

  public static getCurrentQuarterEnd = () => {
    return moment(new Date()).quarter(moment().quarter()).endOf('quarter');
  };

  public static getSkipLimit = (page: number, recordsPerPage = null) => {
    let skip = 0;
    const limit = recordsPerPage ? recordsPerPage : Constants.DATA_LIMIT; // for paginate records
    if (page) {
      skip = (page - 1) * limit;
    }
    return { limit, skip };
  };

  public static setExpireDate(date: any, subcriptionPlan: any) {
    switch (subcriptionPlan) {
      case 'Yearly':
        return moment(date).add(1, 'years').format('YYYY-MM-DD'); // i-1  p-y
      case 'Yearly-Half Pay':
        return moment(date).add(6, 'months').format('YYYY-MM-DD'); // i-  p-
      case 'Monthly':
        return moment(date).add(1, 'months').format('YYYY-MM-DD'); // i-1  p-m
      case 'Quarterly-M':
        return moment(date).add(1, 'months').format('YYYY-MM-DD'); // i-1  p-m
      case 'Quarterly-Y':
        return moment(date).add(3, 'months').format('YYYY-MM-DD'); // i-  p-
      case 'Yearly-5yr':
        return moment(date).add(5, 'years').format('YYYY-MM-DD'); // i-  p-
      case 'Yearly-5yr Half Pay':
        return moment(date).add(2.5, 'years').format('YYYY-MM-DD'); // i-  p-
      case 'Yearly-5yr Qtr Pay':
        return moment(date).add(3, 'months').format('YYYY-MM-DD'); // i-  p-
      case 'Yearly-5yr Three part Pay':
        return moment(date).add(7, 'quarters').format('YYYY-MM-DD'); // i-  p-
      case 'Monthly-Half Yearly Pay':
        return moment(date).add(1, 'months').format('YYYY-MM-DD'); // i-1  p-m
      case 'Yearly-M':
        return moment(date).add(1, 'months').format('YYYY-MM-DD'); // i-1  p-m
      case 'Yearly-Q':
        return moment(date).add(3, 'months').format('YYYY-MM-DD'); // i-  p-
      default:
        throw new Error('Invalid Subcription Plan');
    }
  }

  public static getTodayDateToPrevious = (date: any) => {
    return moment(date).subtract(7, 'days').format(Constants.DEFAULT_TIME_FORMAT);
  };

  public static setPlansperiod(subcriptionPlan: any) {
    switch (subcriptionPlan) {
      case 'Yearly':
        return `yearly`;
      case 'Yearly-Half Pay':
        return `monthly`;
      case 'Monthly':
        return `monthly`;
      case 'Quarterly-M':
        return `monthly`;
      case 'Quarterly-Y':
        return `monthly`;
      case 'Yearly-5yr':
        return `yearly`;
      case 'Yearly-5yr Half Pay':
        return `yearly`;
      case 'Yearly-5yr Qtr Pay':
        return `yearly`;
      case 'Yearly-5yr Three part Pay':
        return `monthly`;
      case 'Monthly-Half Yearly Pay':
        return `monthly`;
      case 'Yearly-M':
        return `monthly`;
      case 'Yearly-Q':
        return `monthly`;
      default:
        throw new Error('Invalid Subcription Plan Period');
    }
  }

  public static invoiceLostClient = async () => {
    try {
      const todayDate = moment().format('YYYY-MM-DD');
      const result = await InvoiceData.update(
        { subcription_type: `Expired` },
        { where: { license_end_date: todayDate } },
      );
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

  public static invoiceExpiredClientMail = async () => {
    try {
      const todayDate = moment().format('YYYY-MM-DD');
      const transport = await sendMail.sendMailSmtp();
      const result = await InvoiceData.findAll({
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
      for (const dataInvoice of result) {
        const getDate = this.getTodayDateToPrevious(dataInvoice.license_end_date);
        if (todayDate === getDate) {
          const email = dataInvoice.customer.email;
          const pathDir = path.resolve(__dirname, '../templates/invoiceExpiredReminder.ejs');
          ejs.renderFile(pathDir, { result: dataInvoice }, function (_err, data) {
            const mailOptions: any = {
              from: process.env.From,
              to: email,
              subject: `Invoice :-` + dataInvoice.invoice_no,
              html: data,
            };
            transport.sendMail(mailOptions, function (error: any, info: { response: string }) {
              if (error) {
                return error;
              } else {
                return 'Email sent successfully: ' + info.response;
              }
            });
          });
        }
      }
    } catch (error) {
      return ResponseBuilder.errorMessage(error, i18next.t('ERR_INTERNAL_SERVER'));
    }
  };

  public static getCustomerId = async (email: any) => {
    const customerData = await Customer.findOne({
      where: {
        email: email,
      },
    });
    return customerData?.id;
  };

  public static updateCustomerInTaskopad = async (data: any) => {
    const options = {
      method: Constants.REQUEST_TYPE.POST,
      headers: {
        authorization: `Bearer ${process.env.TASKOPAD_AUTH_TOKEN}`,
      },
      url: `${process.env.TASKOPAD_BFF_URL}/profile/billingDetailsFromAdmin`,
      data,
    };
    return AxiosUtils.getRequestedData(options);
  };

  public static updateCustomerDetailsInTOP = async (data: any) => {
    const options = {
      method: Constants.REQUEST_TYPE.PUT,
      headers: {
        authorization: `Bearer ${process.env.TASKOPAD_AUTH_TOKEN}`,
      },
      url: `${process.env.TASKOPAD_BFF_URL}/invoice/update-user`,
      data,
    };
    return AxiosUtils.getRequestedData(options);
  };

  public static addPaymentTransactionInTOP = async (data: any) => {
    console.log(process.env.TASKOPAD_SUBSCRIPTION_URL, 'process.env.TASKOPAD_SUBSCRIPTION_URL');
    const options = {
      method: Constants.REQUEST_TYPE.POST,
      headers: {
        authorization: `Bearer ${process.env.TASKOPAD_AUTH_TOKEN}`,
      },
      url: `${process.env.TASKOPAD_SUBSCRIPTION_URL as string}/subscription/create-order-from-Admin`,
      data,
    };
    return AxiosUtils.getRequestedData(options);
  };

  public static updatePaymentTransactionInTOP = async (data: any) => {
    const options = {
      method: Constants.REQUEST_TYPE.PUT,
      headers: {
        authorization: `Bearer ${process.env.TASKOPAD_AUTH_TOKEN}`,
      },
      url: `${process.env.TASKOPAD_SUBSCRIPTION_URL as string}/subscription/updateTransaction`,
      data,
    };
    return AxiosUtils.getRequestedData(options);
  };

  public static userActivePlanData = async (user_id: any) => {
    const options = {
      method: Constants.REQUEST_TYPE.GET,
      headers: {
        authorization: `Bearer ${process.env.TASKOPAD_AUTH_TOKEN}`,
      },
      url: `${process.env.TASKOPAD_SUBSCRIPTION_URL as string}/subscription/getActivePlan?user_id=${user_id}`,
    };
    return AxiosUtils.getRequestedData(options);
  };

  public static calculateFinancialYear() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const isCurrentMonthAfterApril = currentMonth >= 4;
    const financialYearStart = isCurrentMonthAfterApril ? new Date(currentYear, 3, 1) : new Date(currentYear - 1, 3, 1);

    const financialYearEnd = isCurrentMonthAfterApril ? new Date(currentYear + 1, 2, 31) : new Date(currentYear, 2, 31);

    const financialYear = `${currentYear}-${isCurrentMonthAfterApril ? currentYear + 1 : currentYear}`;

    return { financialYearStart, financialYearEnd, financialYear };
  }

  public static async generateNextString(financialYear: any, insertData: any) {
    const financialYearParts = financialYear?.split('-');
    const currentYear = financialYearParts[0]?.substring(2) + '-' + financialYearParts[1]?.substring(2);
    const { seriesPrefix, counter } = await this.getSeriesInfo(currentYear, insertData);
    return `${seriesPrefix}/${counter.toString().padStart(4, '0')}`;
  }

  private static async getSeriesInfo(financialYear: any, insertData: any) {
    const bill = await BillSeries.findOne({
      where: { series: { [Op.like]: `%${financialYear}%` } },
    });
    const seriesPrefix = bill?.series;
    const counter = await this.getNextCounter(seriesPrefix, insertData.invoiceType, Number(bill?.seriesStart));
    return { seriesPrefix, counter };
  }

  private static async getNextCounter(seriesPrefix: any, invoiceType: any, seriesStart: number) {
    const invoiceNo = await InvoiceData.findOne({
      where: {
        invoice_no: { [Op.like]: `%${seriesPrefix}%` },
        invoiceType: invoiceType || Constants.INVOICE_TYPE.TAX,
      },
      order: [['id', 'DESC']],
    });
    return invoiceNo === null ? seriesStart || 1 : Number(invoiceNo.invoice_no.split('/')[2]) + 1;
  }

  // Helper function to calculate alias based on difference in days
  public static calculateAlias(differenceInDays: number): string {
    if (differenceInDays <= 31) {
      return 'monthly';
    } else if (differenceInDays <= 92) {
      return 'quarterly';
    } else if (differenceInDays <= 186) {
      return 'half year';
    } else if (differenceInDays <= 366) {
      return 'year';
    } else if (differenceInDays > 366) {
      return '5 year';
    }
    return '';
  }

  public static toEpoch(date: string | number | Date) {
    return new Date(date).getTime();
  }
}

export default Utils;
