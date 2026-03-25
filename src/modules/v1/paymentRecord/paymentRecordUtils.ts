import * as dotenv from 'dotenv';
import db from '../../../database/db';
import i18next from 'i18next';
import { Constants } from '../../../../config/constants';
import { Op, Sequelize } from 'sequelize';
import Utils from '../../../helpers/utils';
import ResponseBuilder from '../../../helpers/responseBuilder';

dotenv.config();

const PaymentRecord = db.payment_record;
const InvoiceData = db.invoice_data;
const Customer = db.customer;

class PaymentRecordUtils {
  public paymentRecordAdd = async (insertData: any) => {
    try {
      const data = {
        customer_name: insertData.customer_name,
        bill_no: insertData.bill_no,
        bill_amount: insertData.bill_amount,
        payment_received: insertData.payment_received,
        payment_date: insertData.payment_date,
        tds: insertData.tds,
        payment_gateway: insertData.payment_gateway,
        payment_difference: insertData.payment_difference,
        subcription_endDate: insertData.subcription_endDate,
        total_out_standing: insertData.total_out_standing,
        status: insertData.status,
        subcription_startDate: insertData.subcription_startDate,
        razorpay_order_id: insertData?.reference_no || '',
        // subcription_type: insertData.subcription._type,
        // description: insertData.description,
        // plan: insertData.plan,
        // rate: insertData.rate,
      };
      const result = PaymentRecord.create(data);
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

  public paymentRecordgetAll = async (reqQuery: any) => {
    try {
      const { page, limit, search, invoiceType, status, psStart, psEnd, ssStart, ssEnd, seStart, seEnd } = reqQuery;
      const pageReq = parseInt(page) || 1;
      const limitReq = parseInt(limit) || 10;

      const where: any = {
        taxInvoiceNo: null,
        deletedAt: null,
      };
      let include: any = [];

      if (search) {
        where[Op.or] = [
          {
            bill_no: {
              [Op.like]: `%${search}%`,
            },
          },
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('customer_name')), {
            [Op.like]: `%${search.toLowerCase()}%`,
          }),
        ];
      }

      if (psStart && psEnd) {
        where.payment_date = {
          [Op.between]: [psStart, psEnd],
        };
      } else if (ssStart && ssEnd) {
        where.subcription_startDate = {
          [Op.between]: [ssStart, ssEnd],
        };
      } else if (seStart && seEnd) {
        where.subcription_endDate = {
          [Op.between]: [seStart, seEnd],
        };
      }

      if (invoiceType) {
        if (invoiceType === 'direct') {
          where.bill_no = {
            [Op.like]: 'direct%',
          };
        } else if (invoiceType === 'tax') {
          where.bill_no = {
            [Op.notIn]: ['direct payment', 'N/A'],
          };
        } else if (invoiceType === 'none') {
          where.bill_no = {
            [Op.like]: 'N/A%',
          };
        } else {
          // Modify this part as needed based on your actual logic for 'invoiceType'.
          include = [
            {
              model: InvoiceData,
              as: 'invoiceRecord',
              where: {
                invoiceType: invoiceType,
                proformaPaymentId: null,
              },
              attributes: Constants.TABLE_ATTRIBUTES.INVOICE_DATA_ATTRIBUTES,
            },
          ];
        }
      }

      if (status === Constants.PAYMENT_RECORD.PAYMENT_STATUS) {
        where.status = status;
      } else if (status === Constants.PAYMENT_RECORD.PAYMENT_STATUS_UNPAID) {
        where.status = {
          [Op.not]: Constants.PAYMENT_RECORD.PAYMENT_STATUS,
        };
      }

      const offset = (pageReq - 1) * limitReq;
      const { rows, count } = await PaymentRecord.findAndCountAll({
        offset,
        limit: limitReq,
        where,
        include, // Include clause based on your logic
        order: [['id', 'DESC']],
      });

      const pages = Math.ceil(count / limit);

      return {
        result: rows,
        count: count,
        pages: pages,
      };
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

  public paymentRecordfindById = async (id: any) => {
    try {
      const result = await PaymentRecord.findByPk(id);
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

  public paymentRecordupdate = async (id: any, insertData: any) => {
    try {
      const result = await PaymentRecord.update(insertData, { where: { id: id } });
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

  public paymentRecordDelete = async (id: any) => {
    try {
      const result = await PaymentRecord.destroy({ where: { id: id } });
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

  public paymentRecordByInvoice = async (reqQuery: any) => {
    try {
      const page = parseInt(reqQuery?.page) || 1;
      const limit = parseInt(reqQuery?.limit) || Constants.DATA_LIMIT;
      const offset = limit * (page - 1);

      const result = await PaymentRecord.findAndCountAll({
        limit: limit,
        offset: offset,
        where: { [Op.or]: [{ bill_no: reqQuery.bill_no }, { customer_name: reqQuery.customer_name }] },
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

  public totalAmountofCustomer = async (query: any) => {
    try {
      const totalAmount = await InvoiceData.findAll({
        include: [
          {
            model: Customer,
            where: {
              company_name: query.company_name,
            },
          },
        ],
      });

      let totalReceivableAmount = 0;
      let Amount = 0;
      let AmountDiff;

      for (const item of totalAmount) {
        const paidAmount = await PaymentRecord.findAll({
          where: { bill_no: item.invoice_no, customer_name: query.company_name },
        });

        totalReceivableAmount += item.receivable_amount;

        for (const payment of paidAmount) {
          Amount += payment.payment_received;
        }
        AmountDiff = totalReceivableAmount - Amount;
      }

      return {
        TotalAmount: totalReceivableAmount,
        AmountReceived: Amount,
        AmountDifference: AmountDiff,
        // CurrentBillDifference: currentBillDifference,
      };
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

  public getPaymentRecordByCustomerId = async (query: any) => {
    try {
      const page = parseInt(query?.page) || 1;
      const limit = parseInt(query?.limit) || 10;

      const offset = limit * (page - 1);
      const paymentDetails = await PaymentRecord.findAndCountAll({
        include: [
          {
            model: InvoiceData,
            as: 'invoiceRecord',
            where: {
              customerId: await Utils.getCustomerId(query?.email),
            },
            attributes: Constants.TABLE_ATTRIBUTES.INVOICE_DATA_ATTRIBUTES,
          },
        ],
        where: {
          status: Constants.PAYMENT_RECORD.PAYMENT_STATUS,
        },
        offset: offset,
        limit: limit,
      });
      if (paymentDetails) {
        const count = paymentDetails?.count;
        return {
          pages: Math.ceil(count / limit),
          paymentDetails,
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

  public updateAndLinkPayment = async (insertData: any) => {
    try {
      const { proforma_bill_no, tax_invoice_no, paymentId } = insertData;
      const invoiceData = await InvoiceData.findOne({
        where: {
          invoice_no: tax_invoice_no,
        },
      });
      const { customerId, subcription_type, subcriptionPlanId, user, pdfLink } = invoiceData;
      const userId = await Customer.findOne({ where: { id: customerId } });

      const user_id = userId?.taskopad_user_id;
      const userActivePlanData: any = await Utils.userActivePlanData(user_id);

      const user_plan = userActivePlanData?.user_plan;
      if (user_plan) {
        const { total_employee, remaining_employee_limit } = user_plan;
        if (total_employee - remaining_employee_limit > user) {
          return ResponseBuilder.badRequest(i18next.t('INVALID_ACTIVE_EMPLOYEE_LIMIT'));
        }
      }

      const paymentRecordData = await PaymentRecord.findOne({
        where: {
          bill_no: tax_invoice_no,
        },
      });

      const updateInvoice =
        (await InvoiceData.update({ proformaPaymentId: paymentId }, { where: { invoice_no: proforma_bill_no } })) &&
        (await InvoiceData.update({ linkedInvoiceNo: proforma_bill_no }, { where: { invoice_no: tax_invoice_no } }));
      const result = await PaymentRecord.update(
        { taxInvoiceNo: tax_invoice_no },
        { where: proforma_bill_no === 'N/A' ? { id: paymentId } : { bill_no: proforma_bill_no } },
      );

      if (!paymentRecordData) {
        const data = {
          customer_name: insertData.customer_name,
          bill_no: insertData.tax_invoice_no,
          bill_amount: insertData.bill_amount,
          payment_received: insertData.payment_received,
          payment_date: insertData.payment_date,
          tds: insertData.tds,
          payment_gateway: insertData.payment_gateway,
          payment_difference: insertData.payment_difference,
          subcription_endDate: insertData.subcription_endDate,
          total_out_standing: insertData.total_out_standing,
          status: insertData.status,
          subcription_startDate: insertData.subcription_startDate,
          isTdsInPercentage: false,
        };
        await PaymentRecord.create(data);
      }

      if (updateInvoice && result) {
        let taskopadPayload = {};
        let transaction;

        if (proforma_bill_no === Constants.PAYMENT_TYPE.DIRECT) {
          taskopadPayload = {
            order_id: insertData?.razorpay_order_id,
            pdfLink,
          };
          transaction = await Utils.updatePaymentTransactionInTOP(taskopadPayload);
        } else {
          taskopadPayload = {
            user_id,
            plan_id: subcriptionPlanId,
            referral_code: '',
            total_employee: user,
            paid_amount: insertData.payment_received,
            currency_name: 'INR',
            symbol: '₹',
            subscription_type: this.getSubsscriptionType(subcription_type),
            total_price: insertData.payment_received,
            pdfLink,
            order_id: insertData?.razorpay_order_id,
            payment_method: this.getPaymentMethod(insertData?.payment_gateway),
            created_at: Utils.toEpoch(insertData?.subcription_startDate),
            expire_date: Utils.toEpoch(insertData?.subcription_endDate),
            remaining_employee_limit: user - user_plan.total_employee,
            fromAdmin: true,
          };
          transaction = await Utils.addPaymentTransactionInTOP(taskopadPayload);
        }
        return {
          result: result,
          transaction,
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

  public getPaymentMethod = (payment_method: string) => {
    let updatedMethod;
    if (payment_method?.includes('Bank')) {
      updatedMethod = Constants.PAYMENT_METHOD.BANK;
    } else if (payment_method?.includes('Pay')) {
      updatedMethod = Constants.PAYMENT_METHOD.UPI;
    } else {
      updatedMethod = Constants.PAYMENT_METHOD.RAZORPAY;
    }
    return updatedMethod;
  };

  public getSubsscriptionType = (subcription_type: string) => {
    let updatedType;
    switch (subcription_type) {
      case Constants.SUBSCRCIPTION_TYPE.RENEWAL:
        updatedType = Constants.TASKOPAD_SUBSCRCIPTION_TYPE.RENEW;
        break;
      case Constants.SUBSCRCIPTION_TYPE.ADDED_MORE:
        updatedType = Constants.TASKOPAD_SUBSCRCIPTION_TYPE.UPGRADE;
        break;
      default:
        updatedType = Constants.TASKOPAD_SUBSCRCIPTION_TYPE.NEW;
        break;
    }
    return updatedType;
  };
}

export default PaymentRecordUtils;
