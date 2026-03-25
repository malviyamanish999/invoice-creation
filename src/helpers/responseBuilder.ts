import i18next from 'i18next';
export class ResponseBuilder {
  public static successMessage(message: string): ResponseBuilder {
    const rb: ResponseBuilder = new ResponseBuilder();
    rb.statusCode = 200;
    rb.message = message;
    return rb;
  }

  public static errorMessage(result: any, message?: any, code?: any): ResponseBuilder {
    const rb: ResponseBuilder = new ResponseBuilder();
    rb.statusCode = code || 500;
    rb.data = result ? result : [];
    rb.error = message != null ? message : i18next.t('ERR_INTERNAL_SERVER');
    return rb;
  }

  public static badRequest(message: any): ResponseBuilder {
    const rb: ResponseBuilder = new ResponseBuilder();
    rb.statusCode = 400;
    rb.error = message;
    return rb;
  }

  public static data(result: any, message?: string): ResponseBuilder {
    const rb: ResponseBuilder = new ResponseBuilder();
    rb.statusCode = 200;
    rb.data = result ? result : [];
    rb.message = message || '';
    return rb;
  }
  public statusCode: any;
  public message: any;
  public error: any;
  public data: any;
  public description: any;
}

export default ResponseBuilder;
