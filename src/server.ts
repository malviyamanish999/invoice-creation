import express from 'express';
import dotenv from 'dotenv';
import './database/db';
import bodyParser from 'body-parser';
import { Routes } from './routes/routes';
import { Log } from './helpers/logger';
import morgan from "morgan"; // log requests to the console (express4)
import i18next from 'i18next';
import i18Backend from 'i18next-fs-backend';
import * as i18middleware from 'i18next-http-middleware';
import * as path from 'path';
import cors from 'cors';
import { Constants } from '../config/constants';
import fileUpload from 'express-fileupload';
import cron from 'node-cron';
import utils from './helpers/utils';
import expressLayouts from 'express-ejs-layouts';

dotenv.config();

class App {
  public app: express.Application = express();
  private logger = Log.getLogger();

  constructor() {
    this.app.all('/*', (req: any, res, next) => {
      res.header('Access-Control-Allow-Headers', 'Authorization');
      i18next.changeLanguage(req.query.lng);
      return next();
    });

    // use nosonar because we are not returning i18nObject
    const i18nObject = i18next //NOSONAR
      .use(i18Backend)
      .use(i18middleware.LanguageDetector)
      .init({
        initImmediate: false,
        preload: ['en'],
        fallbackLng: ['en'],
        debug: false,
        backend: {
          loadPath: 'src/locales/{{lng}}/translation.json',
        },
      });

    this.app.use(i18middleware.handle(i18next));
    this.middleWare();
    this.Routes();
    this.connection();
    this.invoiceLostClient();
  }

  private middleWare(): void {
    this.app.use(cors());
    this.app.use(express.json());

    this.app.use(morgan("dev")); // log every request to the console

    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(fileUpload({ parseNested: true }));
    this.app.use('public', express.static(__dirname + 'public'));

    const corsOptions = {
      origin: true,
      optionsSuccessStatus: 200, // For legacy browser support
    };
    this.app.use(cors(corsOptions));
    this.app.use(expressLayouts);
    this.app.set('view engine', 'ejs');

    const publicFolder = path.join(__dirname, '../uploads');
    this.app.use('/uploads', express.static(publicFolder));
    this.app.use((err: any, req: any, res: any, next: () => void) => {
      if (err) {
        return res.status(Constants.FAIL_CODE).json({ error: req.t('SOMETHING_WENT_WRONG') });
      } else {
        next();
      }
    });
  }

  private Routes(): void {
    const routes = new Routes();
    this.app.use('/api', routes.path());
  }

  private invoiceLostClient = async () => {
    /*
     * Runs every day
     * at 00:00:00 AM.
     */
    cron.schedule('00 00 * * *', () => {
      utils.invoiceLostClient();
      console.log('Running invoiceLostClient');
    });
    cron.schedule('00 00 * * *', function () {
      utils.invoiceExpiredClientMail();
      console.log('running invoiceExpiredClientMail');
    });
  };

  private connection(): void {
    this.app.listen(process.env.PORT, () => {
      this.logger.info(`server is listening on this port: ${process.env.PORT}`);
    });
  }
}
export default new App().app;
