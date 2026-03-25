import { IsNotEmpty, IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';
import { Model } from '../../../model';

export class CreateModel extends Model {
  @IsNotEmpty()
  @IsString()
  public customer_name: string;

  @IsNotEmpty()
  @IsString()
  public bill_no: string;

  @IsNotEmpty()
  @IsNumber()
  public bill_amount: number;

  @IsNotEmpty()
  @IsNumber()
  public payment_received: number;

  @IsNotEmpty()
  @IsString()
  public payment_gateway: string;

  @IsNotEmpty()
  @IsString()
  public status: string;

  @IsNotEmpty()
  @IsDateString()
  public payment_date: Date;

  constructor(body: any) {
    super();
    const { customer_name, bill_no, bill_amount, payment_received, payment_gateway, status, payment_date } = body;

    this.customer_name = customer_name;
    this.bill_no = bill_no;
    this.bill_amount = bill_amount;
    this.payment_received = payment_received;
    this.payment_gateway = payment_gateway;
    this.status = status;
    this.payment_date = payment_date;
  }
}
export class UpdateModel extends Model {
  @IsOptional()
  @IsString()
  public customer_name: string;

  @IsOptional()
  @IsString()
  public bill_no: string;

  @IsOptional()
  @IsNumber()
  public bill_amount: number;

  @IsOptional()
  @IsNumber()
  public payment_received: number;

  @IsOptional()
  @IsString()
  public payment_gateway: string;

  @IsOptional()
  @IsString()
  public status: string;

  @IsOptional()
  @IsDateString()
  public payment_date: Date;

  constructor(body: any) {
    super();

    this.customer_name = body?.customer_name;
    this.bill_no = body?.bill_no;
    this.bill_amount = body?.bill_amount;
    this.payment_received = body?.payment_received;
    this.payment_gateway = body?.payment_gateway;
    this.status = body?.status;
    this.payment_date = body?.payment_date;
  }
}
