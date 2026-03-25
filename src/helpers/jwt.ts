import jwt from 'jsonwebtoken';
import { Constants } from '../../config/constants';

export class Jwt {
  /*
   * getAuthToken
   */
  public static getAuthToken(data: any, expiryTime: any) {
    return jwt.sign(data, process.env.JWT_SECRET_KEY as string, {
      expiresIn: expiryTime,
    });
  }

  /*
   * decodeAuthToken
   */
  public static decodeAuthToken(token: string) {
    if (token) {
      try {
        return jwt.verify(token, process.env.JWT_SECRET_KEY as string);
      } catch (error: any) {
        if (error.name == Constants.TOKEN_EXPIRE_ERROR) {
          return error.name;
        }
        return false;
      }
    }
    return false;
  }
}
