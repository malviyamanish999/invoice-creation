/**
 * @file Connection.ts
 * @brief : Define Connect to database File
 * @author Manish Malviya
 * @copyright Solution Analysts
 */

import { Sequelize } from 'sequelize';
import tablesync from './tableSync';
import sequelizeDb from '../interface/sequelize';
import dotenv from 'dotenv';
import { Log } from '../helpers/logger';
dotenv.config();

const logger = Log.getLogger();

const sequelize = new Sequelize(process.env.DATABASE ?? '', process.env.DBUSER ?? '', process.env.DBPASSWORD ?? '', {
  host: process.env.DBHOST,
  logging: false,
  pool: {
    max: process.env.DB_MAX_CONNECTION_LIMIT ? +process.env.DB_MAX_CONNECTION_LIMIT : 100,
    idle: process.env.DB_IDLE_CONNECTION_LIMIT ? +process.env.DB_IDLE_CONNECTION_LIMIT : 10000,
  },
  dialect: 'mysql',
});

sequelize
  .authenticate()
  .then(() => {
    logger.info('Connection has been established successfully.');
  })
  .catch((err) => {
    logger.error('Unable to connect to the database:', err);
  });

const db: sequelizeDb = { Sequelize, sequelize };

tablesync(db);

export default db;
