import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import { Log } from './helpers/logger';

dotenv.config();
export class Connection {
  public static get(): Connection {
    if (!Connection.instance) {
      Connection.instance = new Connection();
    }
    return Connection.instance;
  }
  private static instance: Connection;
  public sequelize: any;

  private logger = Log.getLogger();

  private constructor() {
    this.sequelize = new Sequelize(process.env.DATABASE ?? '', process.env.DBUSER ?? '', process.env.DBPASSWORD ?? '', {
      host: process.env.DBHOST,
      dialect: 'mysql',
      pool: {
        max: process.env.DB_MAX_CONNECTION_LIMIT ? +process.env.DB_MAX_CONNECTION_LIMIT : 100,
        idle: process.env.DB_IDLE_CONNECTION_LIMIT ? +process.env.DB_IDLE_CONNECTION_LIMIT : 10000,
      },
      logging: true,
      dialectOptions: {
        multipleStatements: true,
      },
    });

    this.sequelize
      .authenticate()
      .then(() => {
        this.logger.info('Connection has been established successfully.');
      })
      .catch((err: any) => {
        this.logger.error('Unable to connect to the database:', err);
      });
  }
}
