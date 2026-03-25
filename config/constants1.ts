export class LoggerConstants {
  public static LOGGER_LEVEL = {
    INFO: 'INFO',
    DEBUG: 'DEBUG',
    ERROR: 'ERROR',
    PROCESS: 'PROCESS',
    LOG_TRYPE_SYSTEM: 'LOG-TYPE (SYSTEM)',
    LOG_TRYPE_PROCESS: 'LOG-TYPE (PROCESS)',
    EXECUTIONS: 'EXECUTIONS',
  };
  public static USER = {
    SIGNUP: 'SIGNUP',
    LOGIN: 'LOGIN',
    USER_MODULE: 'UserModule',
    USER_CLASS: 'UserController',
    USER_MIDDLEWARE: 'UserMiddleware',
    CHECK_FOR_UNIQUEEMAIL: 'CheckForUniqueEmail',
    CHECK_FOR_VALID_EMAIL: 'checkForValidEmail',
    V1: 'V1',
    EMAIL_NOT_AVAILABLE: 'Email not available',
    EMAIL_AVAILABLE: 'Email not available',
    USER_SIGNUP_SUCESSFULL: 'User Signup Succeed',
    USER_LOGIN_FAILED: 'User Signup Failed',
    USER_LOGIN_SUCESS: 'User Signup Succeed',
    USER_TOKEN_CHECK: 'User token check',
    USER_UNAUTHORIZED: 'User unauthorized',
    USER_TOKEN_EXPIRED: 'User token expired',
    USER_TOKEN_VERIFY: 'User token verify',
    GETALL_INVOICEDATA: 'Get All invoice data',
  };
  public static STATUS_CODES = {
    SUCESS: 200,
    BAD_REQUEST: 400,
  };

  public static URL = {
    URL: 'http://localhost:9000',
  };

  public static messages = {
    DATA_NOT_FOUND: 'Data Not Found',
  };
}
