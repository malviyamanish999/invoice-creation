import { Router } from 'express';
import { authRoute } from '../modules/v1/auth/authRoute';
import { customerRoute } from '../modules/v1/customer/customerRoute';
import { stateRoute } from '../modules/v1/state/stateRoute';
import { billSeriesRoute } from '../modules/v1/billSeries/billseriesRoute';
import { financialYearRoute } from '../modules/v1/financialYear/finacialYearRoute';
import { industryTypeRoute } from '../modules/v1/industryType/industryTypeRoute';
import { paymentGatewayRoute } from '../modules/v1/paymentGateway/paymentGatewayRoute';
import { subcriptionPlanRoute } from '../modules/v1/subcriptionPlan/subcriptionPlanRoute';
import { paymentRecordRoute } from '../modules/v1/paymentRecord/paymentRecordRoute';
import { invoiceDataRoute } from '../modules/v1/invoiceData/invoiceDataRoute';
import { descriptionRoute } from '../modules/v1/description/descriptionRoute';
import { quotationRoute } from '../modules/v1/quotation/quotationRoute';
import { cityRoute } from '../modules/v1/city/cityRoute';
import { countryRoute } from '../modules/v1/country/countryRoute';
import { reportRoute } from '../modules/v1/report/reportRoute';
import { razorPayRoute } from '../modules/v1/razorPay/razorPayRoute';

export class Routes {
  // protected basePath: string;

  public path() {
    const router: Router = Router(); // User Authentication module route
    router.use('/auth', authRoute);

    // Customer module route
    router.use('/customer', customerRoute);

    // state module route
    router.use('/state', stateRoute);

    // billSeries module route
    router.use('/billSeries', billSeriesRoute);

    // financialyear module route
    router.use('/financialyear', financialYearRoute);

    // industryType module route
    router.use('/industryType', industryTypeRoute);

    // paymentGateway module route
    router.use('/paymentGateway', paymentGatewayRoute);

    // subcruptionPlan module route
    router.use('/subcriptionPlan', subcriptionPlanRoute);

    // paymentRecord module route
    router.use('/paymentRecord', paymentRecordRoute);

    // invoiceData module route
    router.use('/invoiceData', invoiceDataRoute);

    // description module route
    router.use('/description', descriptionRoute);

    // quotation module route
    router.use('/quotation', quotationRoute);

    // city module route
    router.use('/city', cityRoute);

    // country module route
    router.use('/country', countryRoute);

    // report module route
    router.use('/summary', reportRoute);

    // payment module route
    router.use('/payment', razorPayRoute);

    router.all('/*', (_req, res) => {
      return res.status(404).json({
        error: 'URL not found',
      });
    });
    return router;
  }
}
