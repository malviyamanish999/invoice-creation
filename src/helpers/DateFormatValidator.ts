import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'dateFormat', async: false })
export class DateFormatConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    // Regular expression to match the "YYYY-MM-DD" format
    const regex = /^\d{4}-\d{2}-\d{2}$/;

    if (typeof value !== 'string' || !regex.test(value)) {
      return false;
    }

    // Optional: Add additional checks for valid date values, if required
    const date = new Date(value);
    return !isNaN(date.getTime());
  }
}

export function IsDateFormat(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: DateFormatConstraint,
    });
  };
}
