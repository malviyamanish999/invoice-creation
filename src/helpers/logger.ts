// import moment from 'moment-timezone';
// import winston, { createLogger, format, transports } from 'winston';
// import { Constants } from '../../config/constants';
// import { v4 as uuidv4 } from 'uuid';
// import { LoggerConstants } from '../../config/constants1';
// const { combine, timestamp, prettyPrint, colorize } = format;
// let uuid: any;
// export class Log {
//   private logger: any;
//   // public static getLogger() {
//   //   return createLogger({
//   //     level: LoggerConstants.LOGGER_LEVEL.INFO,
//   //     transports: new transports.File({
//   //       filename: `src/Logs/server.log`,
//   //       format: format.simple(),
//   //     }),
//   //   });
//   // }

//   public static getLogger() {
//     return createLogger({
//       format: combine(timestamp({ format: this.timestampFormat }), prettyPrint(), colorize()),
//       level: 'debug',
//       // level: LoggerConstants.LOGGER_LEVEL.INFO,
//       transports: [
//         new transports.File({
//           filename: `src/Logs/server.log`,
//           format: format.simple(),
//         }),
//         // new transports.Console(),
//       ],
//     });
//   }
//   constructor() {
//     this.logger = Log.getLogger();
//   }
//   private static timestampFormat: any = moment(new Date()).tz(Constants.TIMEZONE).format('YYYY-MM-DD hh:mm:ss');

//   /**
//    * for generating unique global id for user
//    * @returns {id} unique id
//    */
//   public globalRequestID() {
//     return uuidv4();
//   }

//   /**
//    * for generating Date
//    * @returns {Date}
//    */
//   public getIndanTime() {
//     const momenttime = moment();
//     return momenttime.format('YYYY-MM-DD hh:mm:ss ');
//   }

//   /**
//    * for get the duration of start and end
//    * @param  {Number} end
//    * @param  {Number}start
//    * @returns {Number} Duration
//    */
//   public getDurationInMilliseconds(start: number) {
//     return this.getEndTime() - start;
//   }

//   /**
//    * check for api version
//    * @param {string} url
//    * @returns
//    */
//   public getAPIVesrsion(url: string) {
//     const ApiVesrion = url.split('/');
//     const result = ApiVesrion.find((el: any) => el.includes('v1', 'v2', 'v3', 'v4'));
//     return result ? result : false;
//   }

//   /**
//    *
//    * @returns end time
//    */
//   public getEndTime() {
//     return performance.now();
//   }

//   /**
//    *
//    * @param {Request} req
//    * @returns middleware dureation time
//    */
//   public getMiddlewareDuration(req: { [x: string]: number }) {
//     return this.getEndTime() - req['_startingDureation'];
//   }

//   /**
//    * For get the log input and generate the log output
//    * @param {string} log
//    * @param {string} LogType
//    * @param {string} statusCode
//    * @param {string} startTime
//    * @param {request} req
//    * @param {string} module
//    * @param {string} className
//    * @param {string} methodName
//    * @param {string} userId
//    * @param {string} logMessage
//    * @param {string} responseBody
//    */

//   public static genrateLog() {
//     return createLogger({
//       format: combine(timestamp({ format: this.timestampFormat }), prettyPrint(), colorize()),
//       level: 'debug',
//       transports: [new transports.Console()],
//     });
//   }
//   public genrateLog = (
//     log?: any,
//     LogType?: any,
//     statusCode?: any,
//     startTime?: any,
//     req?: any,
//     module?: any,
//     className?: any,
//     methodName?: any,
//     userId?: any,
//     logMessage?: any,
//     responseBody?: any,
//   ) => {
//     switch (log) {
//       case 'PROCESS':
//         uuid = this.globalRequestID();
//         this.logger.info(
//           ` [${this.getIndanTime()}] : [${uuid}] : [${log}] : [${LogType}] :  [${`http://localhost:9000`}]`,
//         );
//         break;
//       case 'INFO':
//         this.logger.info(`Logger In Method ${methodName}`);
//         this.logger.info(
//           `[${this.getIndanTime()}] : [${uuid}] : [${log}] : [${LogType}] : [${statusCode}] : [Start Time : ${startTime} ms] : [End Time : ${this.getEndTime()} ms] : [Total ExecutionTime ${this.getDurationInMilliseconds(
//             startTime,
//           )} ms] : [${req.ip}] : [${module}] : [${className}] : [${methodName}] : [${JSON.parse(userId)}] : [${
//             req.headers['api-version'] ? req.headers['api-version'] : this.getAPIVesrsion(req.originalUrl)
//           }] : [${logMessage}] : [${JSON.stringify(req.body)}] : [${responseBody}] `,
//         );
//         if (req['_previousMiddleware']) {
//           this.logger.info(
//             `Total Execution Time [${req['_previousMiddleware']}] to [${module}] [${this.getMiddlewareDuration(
//               req,
//             )} ms]`,
//           );
//         }
//         this.logger.info(`Logger Out Method ${methodName}`);
//         break;
//       case 'DEBUG':
//         this.logger.debug(`Logger In Method ${methodName}`);
//         this.logger.debug(
//           `[${this.getIndanTime()}] : [${uuid}] : [${log}] : [${LogType}] : [${statusCode}] : [Start Time : ${startTime} ms] : [End Time : ${this.getEndTime()} ms] : [Total ExecutionTime ${this.getDurationInMilliseconds(
//             startTime,
//           )} ms] : [${req.ip}] : [${module}] : [${className}] : [${methodName}] : [${JSON.parse(userId)}] : [${
//             req.headers['api-version'] ? req.headers['api-version'] : this.getAPIVesrsion(req.originalUrl)
//           }] : [${logMessage}] : [${JSON.stringify(req.body)}] : [${responseBody}] `,
//         );
//         if (req['_previousMiddleware']) {
//           this.logger.debug(
//             `Total Execution Time [${req['_previousMiddleware']}] to [${module}] [${this.getMiddlewareDuration(
//               req,
//             )} ms]`,
//           );
//         }
//         this.logger.debug(`Logger Out Method ${methodName}`);
//         break;
//       case 'ERROR':
//         this.logger.error(`Logger In Method ${methodName}`);
//         this.logger.error(
//           `[${this.getIndanTime()}] : [${uuid}] : [${log}] : [${LogType}] : [${statusCode}] : [Start Time : ${startTime} ms] : [End Time : ${this.getEndTime()} ms] : [Total ExecutionTime ${this.getDurationInMilliseconds(
//             startTime,
//           )} ms] : [${req.ip}] : [${module}] : [${className}] : [${methodName}] : [${JSON.parse(userId)}] : [${
//             req.headers['api-version'] ? req.headers['api-version'] : this.getAPIVesrsion(req.originalUrl)
//           }] : [${logMessage}] : [${JSON.stringify(req.body)}] : [${responseBody}] `,
//         );
//         this.logger.error(`Logger Out Method ${methodName}`);
//         break;
//     }
//   };
// }
import moment from 'moment-timezone';
import { createLogger, format, transports } from 'winston';
import { Constants } from '../../config/constants';

const { combine, timestamp, prettyPrint, colorize } = format;

export class Log {
  public static getLogger() {
    return createLogger({
      format: combine(timestamp({ format: this.timestampFormat }), prettyPrint(), colorize()),
      level: 'debug',
      transports: [new transports.Console()],
    });
  }
  private static timestampFormat: any = moment(new Date()).tz(Constants.TIMEZONE).format('YYYY-MM-DD hh:mm:ss');
}
