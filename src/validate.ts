import { Constants } from '../config/constants';
import { Model } from './model';

export class Validator {
  public validate(arg: Model) {
    return (req: any, res: any, next: any) => {
      Model.getModel(arg, req.body, req.query)
        .then((m2: any) => {
          req.model = m2;
          next();
        })
        .catch((err) => {
          // Refactor validation messages
          const error =
            err.length > 0 && err[0].constraints ? err[0].constraints[`${Object.keys(err[0].constraints)[0]}`] : err;

          const errMessage = error;

          return res.status(Constants.FAIL_CODE).json({ responseMessage: errMessage });
        });
    };
  }
}

export default Validator;
