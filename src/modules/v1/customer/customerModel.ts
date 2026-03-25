import { IsNotEmpty, IsString, IsOptional, IsEmail } from 'class-validator';
import { Model } from '../../../model';

export class CreateModel extends Model {
  @IsNotEmpty({ message: 'Company name is required' })
  @IsString()
  public company_name: string;

  @IsString()
  @IsNotEmpty({ message: 'Client name is required' })
  public client_name: string;

  @IsString()
  @IsNotEmpty({ message: 'industry type is required' })
  public industries_type: string;

  @IsNotEmpty({ message: 'email is required' })
  @IsEmail({}, { message: 'email must be an email' })
  public email: string;

  @IsString()
  @IsNotEmpty({ message: 'mobile number is required' })
  public mobile_no: string;

  @IsString()
  @IsNotEmpty({ message: 'city is required' })
  public city: string;

  @IsString()
  @IsNotEmpty({ message: 'state is required' })
  public state: string;

  @IsString()
  @IsOptional({ message: 'GST number is required' })
  public gst_no: string;

  @IsString()
  @IsNotEmpty({ message: 'Address1 is required' })
  public address1: string;

  constructor(body: any) {
    super();
    const { company_name, client_name, industries_type, email, mobile_no, city, state, gst_no, address1 } = body;

    this.company_name = company_name;
    this.client_name = client_name;
    this.industries_type = industries_type;
    this.email = email;
    this.mobile_no = mobile_no;
    this.city = city;
    this.state = state;
    this.gst_no = gst_no;
    this.address1 = address1;
  }
}
export class UpdateModel extends Model {
  @IsOptional()
  @IsString()
  public company_name: string;

  @IsString()
  @IsOptional()
  public client_name: string;

  @IsString()
  @IsOptional()
  public industries_type: string;

  @IsOptional()
  @IsEmail({}, { message: 'email must be an email' })
  public email: string;

  @IsString()
  @IsOptional()
  public mobile_no: string;

  @IsString()
  @IsOptional()
  public city: string;

  @IsString()
  @IsOptional()
  public state: string;

  @IsString()
  @IsOptional()
  public gst_no: string;

  @IsString()
  @IsOptional()
  public address1: string;

  @IsString()
  @IsOptional()
  public address2: string;

  constructor(body: any) {
    super();
    const { company_name, client_name, industries_type, email, mobile_no, city, state, gst_no, address1, address2 } =
      body;

    this.company_name = company_name;
    this.client_name = client_name;
    this.industries_type = industries_type;
    this.email = email;
    this.mobile_no = mobile_no;
    this.city = city;
    this.state = state;
    this.gst_no = gst_no;
    this.address1 = address1;
    this.address2 = address2;
  }
}
