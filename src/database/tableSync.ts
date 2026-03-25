/**
 * @file tableSync.ts
 * @brief : Define Sequalize table sync File
 * @author Manish Malviya
 * @copyright Solution Analysts
 */

import { DataType } from 'sequelize-typescript';
import { Log } from '../helpers/logger';
import user from '../models/user';
import customer from '../models/customer';
import state from '../models/state';
import industry_type from '../models/industryType';
import bill_series from '../models/billSeries';
import financial_year from '../models/financialYear';
import payment_gateway from '../models/paymentGateway';
import subcription_plan from '../models/subscriptionPlan';
import payment_record from '../models/paymentRecord';
import invoice_data from '../models/invoiceData';
import description from '../models/description';
import quotation from '../models/quotation';
import quotation_history from '../models/quotationHistory';
import city from '../models/city';
import country from '../models/country';
import customerActivityLog from '../models/customerActivityLog';

const logger = Log.getLogger();

async function tablesync(db: any) {
  // create user table
  db.user = user(db.sequelize, DataType);

  // create customer table
  db.customer = customer(db.sequelize, DataType);

  // create state table
  db.state = state(db.sequelize, DataType);

  // create industry_type table
  db.industry_type = industry_type(db.sequelize, DataType);

  // create bill_series table
  db.bill_series = bill_series(db.sequelize, DataType);

  // create financial_year table
  db.financial_year = financial_year(db.sequelize, DataType);

  // create payment_gateway table
  db.payment_gateway = payment_gateway(db.sequelize, DataType);

  // create subcruption_plan table
  db.subcription_plan = subcription_plan(db.sequelize, DataType);

  // create payment_record table
  db.payment_record = payment_record(db.sequelize, DataType);

  // create invoice_data table
  db.invoice_data = invoice_data(db.sequelize, DataType);

  // create description table
  db.description = description(db.sequelize, DataType);

  // create quotation table
  db.quotation = quotation(db.sequelize, DataType);

  // create quotation history table
  db.quotation_history = quotation_history(db.sequelize, DataType);

  // create city table
  db.city = city(db.sequelize, DataType);

  // create country table
  db.country = country(db.sequelize, DataType);

  //create customerActivityLog table
  db.customerActivityLog = customerActivityLog(db.sequelize, DataType);

  db.sequelize.sync().then(() => {
    logger.info('Successfully Sync');
  });

  /* Invoice Associations */
  db.description.hasMany(db.invoice_data);
  db.invoice_data.belongsTo(db.description);

  db.customer.hasMany(db.invoice_data);
  db.invoice_data.belongsTo(db.customer);

  db.subcription_plan.hasMany(db.invoice_data);
  db.invoice_data.belongsTo(db.subcription_plan);

  /* Quotation Associations */
  db.description.hasMany(db.quotation);
  db.quotation.belongsTo(db.description);

  db.customer.hasMany(db.quotation);
  db.quotation.belongsTo(db.customer);

  db.subcription_plan.hasMany(db.quotation);
  db.quotation.belongsTo(db.subcription_plan);

  /* Quotation History Associations */
  db.description.hasMany(db.quotation_history);
  db.quotation_history.belongsTo(db.description);

  db.customer.hasMany(db.quotation_history);
  db.quotation_history.belongsTo(db.customer);

  db.subcription_plan.hasMany(db.quotation_history);
  db.quotation_history.belongsTo(db.subcription_plan);

  db.payment_record.belongsTo(db.invoice_data, {
    foreignKey: 'bill_no', // This is the column in invoice_data that relates to bill_no in payment_record
    targetKey: 'invoice_no', // This is the column in payment_record that invoice_no relates to
    as: 'invoiceRecord',
  });

  db.customerActivityLog.belongsTo(db.user, {
    foreignKey: 'adminId', // This is the column in customerActivityLog that user relates to
    targetKey: 'id', // This is the column in user that relates to adminId in customerActivityLog
    as: 'adminUser',
  });
}

export default tablesync;
