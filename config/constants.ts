export class Constants {
  public static readonly TIMEZONE = 'Asia/Kolkata';
  public static readonly SUCCESS = 'SUCCESS';
  public static readonly ERROR = 'ERROR';
  public static readonly BAD_DATA = 'BAD_DATA';
  public static readonly BACKEND_API_FAILURE = 'BACKEND_API_FAILURE';
  public static readonly CODE = 'CODE';
  public static readonly APPROVED = 'APPROVED';
  public static readonly INVALID_REQUEST = 'INVALID_REQUEST';
  public static readonly FAIL_CODE = 400;
  public static readonly UNAUTHORIZED_CODE = 401;
  public static readonly FORBIDDEN_CODE = 403;
  public static readonly NOT_FOUND_CODE = 404;
  public static readonly SUCCESS_CODE = 200;
  public static readonly INTERNAL_SERVER_ERROR_CODE = 500;
  public static readonly DATA_LIMIT = 10;
  public static readonly DEFAULT_TIME_STAMP_FORMAT = 'YYYY-MM-DD HH:mm:ss';
  public static readonly DEFAULT_TIME_FORMAT = 'YYYY-MM-DD';
  public static readonly YEAR_FORMAT = 'YYYY';
  public static readonly MONTH_FORMAT = 'MM';
  public static readonly DATE_FORMAT = 'DD';
  public static readonly DAYS = 'days';
  public static readonly HASH_PASSWORD_LENGTH = 12;
  public static readonly PAGE = 1;
  public static readonly USER_DATA_LIMIT = 500;
  public static readonly VERIFICATION_CODE_LENGTH = 9;
  public static readonly CODE_EXPIRY_TIME_UNIT = 'minutes';
  public static readonly CODE_EXPIRY_TIME = 30;
  public static readonly ACCOUNT_LINK_EXPIRY_UNIT = 'hours';
  public static readonly ACCOUNT_LINK_EXPIRY_TIME = 24;
  public static readonly NAME_MAX_LENGTH = 45;
  public static readonly ADDRESS_MAX_LENGTH = 100;
  public static readonly COMMON_MAX_LENGTH = 255;
  public static readonly MOBILE_MAX_LENGTH = 15;
  public static readonly DEFAULT_SORTING_ORDER = 'DESC';
  public static readonly PRIMARY_ROLE = 'Primary';
  public static readonly SECONDARY_ROLE = 'Secondary';
  public static readonly DEFAULT_COUNTRY_CODE = 'US';
  public static readonly UPLOAD_TYPES = { PROFILE_PICTURE: 'PROFILE_PICTURE', NO_TYPE: 'NO_TYPE' };
  public static readonly PASSOWRD_CODE_LENGTH = 10;

  public static readonly SYSTEM_LOG_TYPES = {
    AUTHENTICATED: 'AUTHENTICATED',
    RESET_PASSWORD_STARTED: 'RESET_PASSWORD_STARTED',
    RESET_PASSWORD_ENDED: 'RESET_PASSWORD_ENDED',
    CHANGE_PASSWORD: 'CHANGE_PASSWORD',
    CREATE_USER: 'CREATE_USER',
    DISABLE_USER: 'DISABLE_USER',
    ENABLE_USER: 'ENABLE_USER',
    UPDATE_USER: 'UPDATE_USER',
    DELETE_USER: 'DELETE_USER',
    CREATE_LOCATION: 'CREATE_LOCATION',
    UPDATE_LOCATION: 'UPDATE_LOCATION',
    DELETE_LOCATION: 'DELETE_LOCATION',
    DISABLE_LOCATION: 'DISABLE_LOCATION',
    ENABLE_LOCATION: 'ENABLE_LOCATION',
    CREATE_CLIENT: 'CREATE_CLIENT',
    UPDATE_CLIENT: 'UPDATE_CLIENT',
    DISABLE_CLIENT: 'DISABLE_CLIENT',
    ENABLE_CLIENT: 'ENABLE_CLIENT',
    DELETE_CLIENT: 'DELETE_CLIENT',
    CREATE_DEVICE: 'CREATE_DEVICE',
    UPDATE_DEVICE: 'UPDATE_DEVICE',
    DELETE_DEVICE: 'DELETE_DEVICE',
    CREATE_CONTENT: 'CREATE_CONTENT',
    UPDATE_CONTENT: 'UPDATE_CONTENT',
    DISABLE_CONTENT: 'DISABLE_CONTENT',
    ENABLE_CONTENT: 'ENABLE_CONTENT',
    ADD_CONDITION: 'ADD_CONDITION',
  };

  public static readonly TOKEN_EXPIRE_ERROR = 'TokenExpiredError';

  public static imageTypeArr = ['jepg', 'jpg', 'png'];

  public static gstNoregexPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

  public static phoneNoregexPattern = /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[789]\d{9}$/;

  public static TABLE_ATTRIBUTES = {
    USER_ATTRIBUTES: ['email', 'first_name', 'last_name', 'role', 'token'],
    INVOICE_DATA_ATTRIBUTES: ['invoice_no', 'total_amount', 'user'],
    SUBSCRIPTION_PLAN_ATTRIBUTES: ['type', 'rate'],
  };

  public static PAYMENT_RECORD = {
    PAYMENT_STATUS: 'paid',
    PAYMENT_STATUS_UNPAID: 'unPaid',
    AUTHORISED: 'authorized',
  };

  public static readonly WEBHOOK_EVENT = {
    AUTHORIZED: 'payment.authorized',
    CAPTURED: 'paymen.captured',
    FAILED: 'payment.failed',
    PAID: 'payment_link.paid',
  };

  public static REQUEST_TYPE = {
    GET: 'GET',
    PUT: 'PUT',
    POST: 'POST',
  };

  public static INVOICE_TYPE = {
    TAX: 'tax',
    PROFORMA: 'proforma',
  };

  public static EMAIL_MESSAGES = {
    QUOTATION: 'Payment for Quotation No :-',
    INVOICE: 'Payment for invoice No :-',
  };

  public static TASKOPAD_AUTHORIZATION = 'taskopad-authorization';
  public static ACTIVITY_LOG = {
    USER_ID: 'userId',
    OWNER_ID: 'ownerId',
  };

  public static UPDATE_USER_DATA = {
    EMPLOYEE_LIMIT: 'employeeLimit',
    FILE_STORAGE_LIMIT: 'fileStorageLimit',
  };

  public static readonly TASKOPAD_SUBSCRCIPTION_TYPE = {
    NEW: 'new',
    RENEW: 'renew',
    UPGRADE: 'upgrade',
  };

  public static readonly SUBSCRCIPTION_TYPE = {
    RENEWAL: 'Renewal',
    ADDED_MORE: 'Added More',
  };

  public static PAYMENT_TYPE = {
    DIRECT: 'Direct Payment',
  };

  public static readonly PAYMENT_METHOD = {
    BANK: 'bank-account',
    RAZORPAY: 'razor-pay',
    UPI: 'UPI',
  };
}
