import * as dotenv from 'dotenv';
import db from '../../../database/db';
import i18next from 'i18next';
import moment from 'moment';
import { Op } from 'sequelize';
import { Constants } from '../../../../config/constants';
import utils from '../../../helpers/utils';

dotenv.config();

const InvoiceData = db.invoice_data;
const Customer = db.customer;
const SubcriptionPlan = db.subcription_plan;
const Description = db.description;

class ReportUtils {
  public summaryReport = async (startDate: any, endDate: any) => {
    try {
      const data = [];
      const plans = await SubcriptionPlan.findAll();
      for (const plan of plans) {
        const planType = plan.id;
        const where = this.whereConditionForInvoice(startDate, endDate, planType);
        const result = await this.getInvoiceData(where);

        let summaryDetails = {
          todayTotalUsers: 0,
          todayTotalAmount: 0,
          currentweekTotalUsers: 0,
          currentWeekTotalAmount: 0,
          currentMonthTotalUsers: 0,
          currentMonthTotalAmount: 0,
          currentQuarterTotalUsers: 0,
          currentQuarterTotalAmount: 0,
          currentYearTotalUsers: 0,
          currentYeartotalAmount: 0,
          totalUsers: 0,
          totalAmount: 0,
          alias: '',
        };
        const subcription_plan_type = plan.type;

        result.forEach((invoice: any) => {
          summaryDetails = this.getTimeData(invoice, summaryDetails);
        });
        const resultData = {
          SubcriptionPlanType: subcription_plan_type,
          Today_Total_Users: summaryDetails.todayTotalUsers,
          Today_Total_Amount: summaryDetails.todayTotalAmount,
          CurrentweekTotalUsers: summaryDetails.currentweekTotalUsers,
          CurrentWeekTotalAmount: summaryDetails.currentWeekTotalAmount,
          CurrentMonthTotalUsers: summaryDetails.currentMonthTotalUsers,
          CurrentMonthTotalAmount: summaryDetails.currentMonthTotalAmount,
          CurrentQuarterTotalUsers: summaryDetails.currentQuarterTotalUsers,
          CurrentQuarterTotalAmount: summaryDetails.currentQuarterTotalAmount,
          CurrentYearTotalUsers: summaryDetails.currentYearTotalUsers,
          CurrentYearTotalAmount: summaryDetails.currentYeartotalAmount,
          TotalUsers: summaryDetails.totalUsers,
        };
        data.push(resultData);
      }
      if (data) {
        const clientData = this.getClientResponse(data);

        return {
          SummaryDetails: data,
          TodayAllUser: clientData.todayAllTotalUsers,
          TodayAllTotalAmount: clientData.todayAllTotalAmount,
          WeeklyAllUser: clientData.currentweekAllTotalUsers,
          WeeklyAllTotalAmount: clientData.currentWeekTotalAmount,
          MonthlyAllUser: clientData.currentMonthAllTotalUsers,
          MonthlyAllTotalAmount: clientData.currentMonthAllTotalAmount,
          QuarterlyAllUser: clientData.currentQuarterAllTotalUsers,
          QuarterlyAllTotaAmount: clientData.currentQuarterAllTotalAmount,
          YearlyAllUser: clientData.currentYearAllTotalUsers,
          YearlyAllTotalAmount: clientData.currentYearAlltotalAmount,
          AllUser: clientData.totalAllUsers,
        };
      } else {
        return this.handleNoData();
      }
    } catch (error: any) {
      return this.handleServerError(error);
    }
  };

  public datesBetweenSummary = async (startDate: any, endDate: any) => {
    try {
      return InvoiceData.findAll({
        where: { createdAt: { [Op.between]: [startDate, endDate] } },
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
    } catch (error: any) {
      return this.handleServerError(error);
    }
  };

  public lostClientReport = async (startDate: any, endDate: any) => {
    try {
      const reportData = [];
      const plans = await SubcriptionPlan.findAll();
      for (const plan of plans) {
        const planType = plan.id;
        const where = this.whereConditionForInvoiceExpired(startDate, endDate, planType);
        const result = await this.getInvoiceData(where);

        let summaryDetails = {
          todayTotalUsers: 0,
          todayTotalAmount: 0,
          currentweekTotalUsers: 0,
          currentWeekTotalAmount: 0,
          currentMonthTotalUsers: 0,
          currentMonthTotalAmount: 0,
          currentQuarterTotalUsers: 0,
          currentQuarterTotalAmount: 0,
          currentYearTotalUsers: 0,
          currentYeartotalAmount: 0,
          totalUsers: 0,
          totalAmount: 0,
          alias: '',
        };

        const subcription_plan_type = plan.type;
        const lostClient = true;
        result.forEach((invoice: any) => {
          summaryDetails = this.getTimeData(invoice, summaryDetails, lostClient);
        });
        const resultData = {
          SubcriptionPlanType: subcription_plan_type,
          Today_Total_Users: summaryDetails.todayTotalUsers,
          Today_Total_Amount: summaryDetails.todayTotalAmount,
          CurrentweekTotalUsers: summaryDetails.currentweekTotalUsers,
          CurrentWeekTotalAmount: summaryDetails.currentWeekTotalAmount,
          CurrentMonthTotalUsers: summaryDetails.currentMonthTotalUsers,
          CurrentMonthTotalAmount: summaryDetails.currentMonthTotalAmount,
          CurrentQuarterTotalUsers: summaryDetails.currentQuarterTotalUsers,
          CurrentQuarterTotalAmount: summaryDetails.currentQuarterTotalAmount,
          CurrentYearTotalUsers: summaryDetails.currentYearTotalUsers,
          CurrentYearTotalAmount: summaryDetails.currentYeartotalAmount,
          TotalUsers: summaryDetails.totalUsers,
        };
        reportData.push(resultData);
      }
      if (reportData) {
        const clientData = this.getClientResponse(reportData);
        return {
          SummaryDetails: reportData,
          TodayAllUser: clientData.todayAllTotalUsers,
          TodayAllTotalAmount: clientData.todayAllTotalAmount,
          WeeklyAllUser: clientData.currentweekAllTotalUsers,
          WeeklyAllTotalAmount: clientData.currentWeekTotalAmount,
          MonthlyAllUser: clientData.currentMonthAllTotalUsers,
          MonthlyAllTotalAmount: clientData.currentMonthAllTotalAmount,
          QuarterlyAllUser: clientData.currentQuarterAllTotalUsers,
          QuarterlyAllTotaAmount: clientData.currentQuarterAllTotalAmount,
          YearlyAllUser: clientData.currentYearAllTotalUsers,
          YearlyAllTotalAmount: clientData.currentYearAlltotalAmount,
          AllUser: clientData.totalAllUsers,
        };
      } else {
        return this.handleNoData();
      }
    } catch (error: any) {
      return this.handleServerError(error);
    }
  };

  public getClientResponse = (reportData: any) => {
    const clientResponse = {
      todayAllTotalUsers: 0,
      todayAllTotalAmount: 0,
      currentweekAllTotalUsers: 0,
      currentWeekTotalAmount: 0,
      currentMonthAllTotalUsers: 0,
      currentMonthAllTotalAmount: 0,
      currentQuarterAllTotalUsers: 0,
      currentQuarterAllTotalAmount: 0,
      currentYearAllTotalUsers: 0,
      currentYearAlltotalAmount: 0,
      totalAllUsers: 0,
    };
    reportData.forEach((item: any) => {
      clientResponse.todayAllTotalUsers += item.Today_Total_Users;
      clientResponse.todayAllTotalAmount += item.Today_Total_Amount;
      clientResponse.currentweekAllTotalUsers += item.CurrentweekTotalUsers;
      clientResponse.currentWeekTotalAmount += item.CurrentWeekTotalAmount;
      clientResponse.currentMonthAllTotalUsers += item.CurrentMonthTotalUsers;
      clientResponse.currentMonthAllTotalAmount += item.CurrentMonthTotalAmount;
      clientResponse.currentQuarterAllTotalUsers += item.CurrentQuarterTotalUsers;
      clientResponse.currentQuarterAllTotalAmount += item.CurrentQuarterTotalAmount;
      clientResponse.currentYearAllTotalUsers += item.CurrentYearTotalUsers;
      clientResponse.currentYearAlltotalAmount += item.CurrentYearTotalAmount;
      clientResponse.totalAllUsers += item.TotalUsers;
    });
    return clientResponse;
  };

  public newsummaryReport = async (startDate: any, endDate: any) => {
    try {
      const data: any = [];
      const plans = await SubcriptionPlan.findAll();
      for (const plan of plans) {
        const planType = plan.id;
        const where = this.whereConditionForInvoice(startDate, endDate, planType);
        const result = await this.getInvoiceData(where);

        let summaryDetails = {
          todayTotalUsers: 0,
          todayTotalAmount: 0,
          currentweekTotalUsers: 0,
          currentWeekTotalAmount: 0,
          currentMonthTotalUsers: 0,
          currentMonthTotalAmount: 0,
          currentQuarterTotalUsers: 0,
          currentQuarterTotalAmount: 0,
          currentYearTotalUsers: 0,
          currentYeartotalAmount: 0,
          totalUsers: 0,
          totalAmount: 0,
          alias: '',
        };

        summaryDetails = this.getSummaryDetails(result, summaryDetails);
        const resultData = {
          Alias: summaryDetails.alias, // Add the alias to the resultData object
          Today_Total_Users: summaryDetails.todayTotalUsers,
          Today_Total_Amount: summaryDetails.todayTotalAmount,
          CurrentweekTotalUsers: summaryDetails.currentweekTotalUsers,
          CurrentWeekTotalAmount: summaryDetails.currentWeekTotalAmount,
          CurrentMonthTotalUsers: summaryDetails.currentMonthTotalUsers,
          CurrentMonthTotalAmount: summaryDetails.currentMonthTotalAmount,
          CurrentQuarterTotalUsers: summaryDetails.currentQuarterTotalUsers,
          CurrentQuarterTotalAmount: summaryDetails.currentQuarterTotalAmount,
          CurrentYearTotalUsers: summaryDetails.currentYearTotalUsers,
          CurrentYearTotalAmount: summaryDetails.currentYeartotalAmount,
          TotalUsers: summaryDetails.totalUsers,
        };
        data.push(resultData);
      }
      return this.summaryResponse(data);
    } catch (error: any) {
      return this.handleServerError(error);
    }
  };

  public getWeekCondition = (weekStartDate: any, weekEndDate: any) => {
    return weekStartDate == utils.getCurrentWeekStartDate() && weekEndDate == utils.getCurrentWeekEndDate();
  };

  public getTimeData = (invoice: any, summary: any, lostClient?: any) => {
    const licenseDate = lostClient === true ? invoice?.license_end_date : invoice?.license_start_date;
    const today: any = licenseDate;
    const year: any = moment(licenseDate).format('YYYY');
    const month: any = moment(licenseDate).format('MM');
    const weekStartDate = moment(licenseDate).startOf('week').format('DD');
    const weekEndDate = moment(licenseDate).endOf('week').format('DD');
    const currentQuarterStart = moment(licenseDate).quarter(moment().quarter()).startOf('quarter');
    const currentQuarterEnd = moment(licenseDate).quarter(moment().quarter()).endOf('quarter');

    if (today === utils.getTodayDate()) {
      summary.todayTotalUsers += invoice.user;
      summary.todayTotalAmount += invoice.final_amount;
    }
    if (month == utils.getCurrentMonth()) {
      summary.currentMonthTotalUsers += invoice.user;
      summary.currentMonthTotalAmount += invoice.final_amount;
    }
    if (this.getWeekCondition(weekStartDate, weekEndDate)) {
      summary.currentweekTotalUsers += invoice.user;
      summary.currentWeekTotalAmount += invoice.final_amount;
    }
    if (currentQuarterStart && currentQuarterEnd) {
      summary.currentQuarterTotalUsers += invoice.user;
      summary.currentQuarterTotalAmount += invoice.final_amount;
    }
    if (year == utils.getCurrentYear()) {
      summary.currentYearTotalUsers += invoice.user;
      summary.currentYeartotalAmount += invoice.final_amount;
    }
    summary.totalUsers += invoice?.user;
    summary.totalAmount += invoice?.final_amount;
    return summary;
  };

  public summaryResponse = (data: any) => {
    if (data.length !== 0) {
      let todayAllTotalUsers = 0;
      let todayAllTotalAmount = 0;
      let currentweekAllTotalUsers = 0;
      let currentWeekTotalAmount = 0;
      let currentMonthAllTotalUsers = 0;
      let currentMonthAllTotalAmount = 0;
      let currentQuarterAllTotalUsers = 0;
      let currentQuarterAllTotalAmount = 0;
      let currentYearAllTotalUsers = 0;
      let currentYearAlltotalAmount = 0;
      let totalAllUsers = 0;
      let totalAllAmount = 0;
      const aliasMap = new Map();

      data.forEach((item: any) => {
        todayAllTotalUsers += item.Today_Total_Users;
        todayAllTotalAmount += item.Today_Total_Amount;
        currentweekAllTotalUsers += item.CurrentweekTotalUsers;
        currentWeekTotalAmount += item.CurrentWeekTotalAmount;
        currentMonthAllTotalUsers += item.CurrentMonthTotalUsers;
        currentMonthAllTotalAmount += item.CurrentMonthTotalAmount;
        currentQuarterAllTotalUsers += item.CurrentQuarterTotalUsers;
        currentQuarterAllTotalAmount += item.CurrentQuarterTotalAmount;
        currentYearAllTotalUsers += item.CurrentYearTotalUsers;
        currentYearAlltotalAmount += item.CurrentYearTotalAmount;
        totalAllUsers += item.TotalUsers;
        totalAllAmount += item.TotalAmount;

        const alias = item.Alias;
        if (!aliasMap.has(alias)) {
          aliasMap.set(alias, item);
        } else {
          const existingItem = aliasMap.get(alias);
          existingItem.CurrentMonthTotalUsers += item.CurrentMonthTotalUsers;
          existingItem.CurrentMonthTotalAmount += item.CurrentMonthTotalAmount;
          existingItem.CurrentQuarterTotalUsers += item.CurrentQuarterTotalUsers;
          existingItem.CurrentQuarterTotalAmount += item.CurrentQuarterTotalAmount;
          existingItem.CurrentYearTotalUsers += item.CurrentYearTotalUsers;
          existingItem.CurrentYearTotalAmount += item.CurrentYearTotalAmount;
          existingItem.TotalUsers += item.TotalUsers;
        }
      });

      return {
        SummaryDetails: this.mergeAndSortData(aliasMap),
        TodayAllUser: todayAllTotalUsers,
        TodayAllTotalAmount: todayAllTotalAmount,
        WeeklyAllUser: currentweekAllTotalUsers,
        WeeklyAllTotalAmount: currentWeekTotalAmount,
        MonthlyAllUser: currentMonthAllTotalUsers,
        MonthlyAllTotalAmount: currentMonthAllTotalAmount,
        QuarterlyAllUser: currentQuarterAllTotalUsers,
        QuarterlyAllTotaAmount: currentQuarterAllTotalAmount,
        YearlyAllUser: currentYearAllTotalUsers,
        YearlyAllTotalAmount: currentYearAlltotalAmount,
        AllUser: totalAllUsers,
      };
    } else {
      return this.handleNoData();
    }
  };

  private getInvoiceData = async (where: any) => {
    return InvoiceData.findAll({
      where: where,
      include: [{ model: Description }, { model: Customer }, { model: SubcriptionPlan }],
    });
  };

  private mergeAndSortData = (aliasMap: any) => {
    const aliasSequence = ['monthly', 'quarterly', 'half year', 'year', '5 year'];

    // Create a new array to store the merged data in the desired sequence
    const mergedData: any[] = [];

    // Iterate over the alias sequence
    for (const alias of aliasSequence) {
      // Check if the current alias exists in the aliasMap
      if (aliasMap.has(alias)) {
        const item = aliasMap.get(alias);
        mergedData.push(item);
      }
    }
    return mergedData;
  };

  private handleNoData = () => {
    return {
      statusCode: Constants.FAIL_CODE,
      message: i18next.t('NOT_FOUND'),
    };
  };

  private handleServerError = (error: any) => {
    return {
      statusCode: Constants.INTERNAL_SERVER_ERROR_CODE,
      data: {
        statusCode: Constants.INTERNAL_SERVER_ERROR_CODE,
        error: error.toString(),
        message: i18next.t('ERR_INTERNAL_SERVER'),
      },
    };
  };

  public whereConditionForInvoice = (startDate: any, endDate: any, planType: any) => {
    if (startDate && endDate) {
      return {
        subcriptionPlanId: planType,
        subcription_type: { [Op.notLike]: `%Expired` },
        license_start_date: { [Op.between]: [startDate, endDate] },
      };
    } else {
      return { subcriptionPlanId: planType, subcription_type: { [Op.notLike]: `%Expired` } };
    }
  };

  public whereConditionForInvoiceExpired = (startDate: any, endDate: any, planType: any) => {
    if (startDate && endDate) {
      return {
        subcriptionPlanId: planType,
        subcription_type: { [Op.like]: `%Expired%` },
        license_start_date: { [Op.between]: [startDate, endDate] },
      };
    } else {
      return {
        subcriptionPlanId: planType,
        subcription_type: { [Op.like]: `%Expired%` },
      };
    }
  };

  public lostClientSummaryReport = async (startDate: any, endDate: any) => {
    try {
      const data: any = [];
      const plans = await SubcriptionPlan.findAll();
      for (const plan of plans) {
        const planType = plan.id;
        const where = this.whereConditionForInvoiceExpired(startDate, endDate, planType);
        const result = await this.getInvoiceData(where);

        let summaryDetails = {
          todayTotalUsers: 0,
          todayTotalAmount: 0,
          currentweekTotalUsers: 0,
          currentWeekTotalAmount: 0,
          currentMonthTotalUsers: 0,
          currentMonthTotalAmount: 0,
          currentQuarterTotalUsers: 0,
          currentQuarterTotalAmount: 0,
          currentYearTotalUsers: 0,
          currentYeartotalAmount: 0,
          totalUsers: 0,
          totalAmount: 0,
          alias: '',
        };

        summaryDetails = this.getSummaryDetails(result, summaryDetails);

        const resultData = {
          Alias: summaryDetails.alias, // Add the alias to the resultData object
          Today_Total_Users: summaryDetails.todayTotalUsers,
          Today_Total_Amount: summaryDetails.todayTotalAmount,
          CurrentweekTotalUsers: summaryDetails.currentweekTotalUsers,
          CurrentWeekTotalAmount: summaryDetails.currentWeekTotalAmount,
          CurrentMonthTotalUsers: summaryDetails.currentMonthTotalUsers,
          CurrentMonthTotalAmount: summaryDetails.currentMonthTotalAmount,
          CurrentQuarterTotalUsers: summaryDetails.currentQuarterTotalUsers,
          CurrentQuarterTotalAmount: summaryDetails.currentQuarterTotalAmount,
          CurrentYearTotalUsers: summaryDetails.currentYearTotalUsers,
          CurrentYearTotalAmount: summaryDetails.currentYeartotalAmount,
          TotalUsers: summaryDetails.totalUsers,
        };
        data.push(resultData);
      }
      return this.summaryResponse(data);
    } catch (error: any) {
      return this.handleServerError(error);
    }
  };

  public getSummaryDetails = (result: any, summaryDetails: any) => {
    result.forEach((invoice: any) => {
      const { license_start_date, license_end_date } = invoice;
      const startDateTime = new Date(license_start_date);
      const endDateTime = new Date(license_end_date);
      const differenceInTime = endDateTime.getTime() - startDateTime.getTime();
      const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));

      summaryDetails.alias = utils.calculateAlias(differenceInDays);
      summaryDetails = this.getTimeData(invoice, summaryDetails);
    });
    return summaryDetails;
  };
}

export default ReportUtils;
