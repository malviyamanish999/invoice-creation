import { IsNotEmpty, IsEmail, IsString, Length, IsOptional } from 'class-validator';
import { Model } from '../../../model';

export enum role {
  creator,
  manager,
}

export class CreateModel extends Model {
  @IsNotEmpty()
  @IsEmail({}, { message: 'email must be an email' })
  @IsEmail()
  public email: string;

  @IsString()
  @Length(8, 20, { message: 'Minimum 8 characters And Maximum 20 characters allowed in Password' })
  @IsNotEmpty({ message: 'New Password is required' })
  public password: string;

  @IsNotEmpty()
  @IsString()
  public first_name: string;

  @IsNotEmpty()
  @IsString()
  public last_name: string;

  constructor(data: any) {
    super();
    const { email, password, first_name, last_name } = data;

    this.email = email;
    this.password = password;
    this.first_name = first_name;
    this.last_name = last_name;
  }
}

export class UpdateModel extends Model {
  @IsOptional()
  @IsEmail({}, { message: 'email must be an email' })
  @IsEmail()
  public email: string;

  // @IsString()
  // @Length(8, 20, { message: 'Minimum 8 characters And Maximum 20 characters allowed in Password' })
  // @IsNotEmpty({ message: 'New Password is required' })
  // public password: string;

  @IsOptional()
  @IsString()
  public first_name: string;

  @IsOptional()
  @IsString()
  public last_name: string;

  @IsOptional()
  @IsString()
  public role: string;

  constructor(data: any) {
    super();
    const { email, first_name, last_name } = data;

    this.email = email;
    this.first_name = first_name;
    this.last_name = last_name;
    this.role = data?.role;
  }
}

export class LoginModel extends Model {
  @IsEmail({}, { message: 'email must be an email' })
  @IsNotEmpty({ message: 'email is required' })
  public email: string;
  @IsNotEmpty({ message: 'Password is required' })
  public password: string;

  constructor(body: any) {
    super();
    const { email, password } = body;
    this.email = email;
    this.password = password;
  }
}

export class ForgotPasswordModel extends Model {
  @IsEmail({}, { message: 'email must be an email' })
  @IsNotEmpty({ message: 'email is required' })
  public email: string;

  constructor(body: any) {
    super();
    const { email } = body;

    this.email = email;
  }
}

export class ChangePasswordModel extends Model {
  // @IsEmail({}, { message: "ERR_INVALID_EMAIL" })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  public password: string;

  @IsString()
  @Length(8, 20, {
    message: 'Minimum 8 characters And Maximum 20 characters allowed in Password',
  })
  @IsNotEmpty({ message: 'New Password is required' })
  public newpassword: string;

  @IsString()
  @IsNotEmpty({ message: 'Confirmation password is required' })
  public password_confirmation: string;

  constructor(body: any) {
    super();
    const { password, newpassword, password_confirmation } = body;

    this.password = password;
    this.newpassword = newpassword;
    this.password_confirmation = password_confirmation;
  }
}

export class ResetPasswordModel extends Model {
  // @IsEmail({}, { message: "ERR_INVALID_EMAIL" })

  @IsString()
  @Length(8, 20, {
    message: 'Minimum 8 characters And Maximum 20 characters allowed in Password',
  })
  @IsNotEmpty({ message: 'New Password is required' })
  public newpassword: string;

  @IsString()
  @IsNotEmpty({ message: 'Confirmation password is required' })
  public password_confirmation: string;

  constructor(body: any) {
    super();
    const { newpassword, password_confirmation } = body;

    this.newpassword = newpassword;
    this.password_confirmation = password_confirmation;
  }
}

export class SocialModel extends Model {
  @IsNotEmpty({ message: 'LOGIN_TYPE_REQUIRED' })
  public loginType: string;
  @IsNotEmpty()
  public socialId: string;

  constructor(body: any) {
    super();
    const { loginType, socialId } = body;

    this.loginType = loginType;
    this.socialId = socialId;
  }
}
