import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';
import { Model } from '../../../model';

export class CreateModel extends Model {
  @IsNotEmpty()
  @IsString()
  public subcription_type: string;

  @IsNotEmpty()
  @IsNumber()
  public rate: number;

  @IsNotEmpty()
  @IsNumber()
  public total_amount: number;

  @IsNotEmpty()
  @IsNumber()
  public descriptionId: number;

  @IsNotEmpty()
  @IsNumber()
  public receivable_amount: number;

  @IsNotEmpty()
  @IsNumber()
  public customerId: number;

  @IsNotEmpty()
  @IsNumber()
  public subcriptionPlanId: number;

  @IsNotEmpty()
  @IsString()
  public validate_for: string;

  @IsNotEmpty()
  @IsNumber()
  public calendar_days: number;

  constructor(body: any) {
    super();
    const { subcription_type } = body;
    const { rate } = body;
    const { descriptionId } = body;
    const { total_amount } = body;
    const { receivable_amount } = body;
    const { customerId } = body;
    const { subcriptionPlanId, calendar_days } = body;
    const { validate_for } = body;

    this.subcription_type = subcription_type;
    this.rate = rate;
    this.descriptionId = descriptionId;
    this.total_amount = total_amount;
    this.receivable_amount = receivable_amount;
    this.customerId = customerId;
    this.subcriptionPlanId = subcriptionPlanId;
    this.validate_for = validate_for;
    this.calendar_days = calendar_days;
  }
}
export class UpdateModel extends Model {
  @IsOptional()
  @IsString()
  public subcription_type: string;

  @IsOptional()
  @IsNumber()
  public rate: number;

  @IsOptional()
  @IsNumber()
  public total_amount: number;

  @IsOptional()
  @IsNumber()
  public descriptionId: number;

  @IsOptional()
  @IsNumber()
  public receivable_amount: number;

  @IsOptional()
  @IsNumber()
  public customerId: number;

  @IsOptional()
  @IsNumber()
  public subcriptionPlanId: number;

  @IsOptional()
  @IsString()
  public validate_for: string;

  @IsOptional()
  @IsNumber()
  public calendar_days: number;

  constructor(body: any) {
    super();
    const { subcription_type } = body;
    const { rate } = body;
    const { descriptionId } = body;
    const { total_amount } = body;
    const { receivable_amount } = body;
    const { customerId } = body;
    const { subcriptionPlanId, validate_for, calendar_days } = body;

    this.subcription_type = subcription_type;
    this.rate = rate;
    this.descriptionId = descriptionId;
    this.total_amount = total_amount;
    this.receivable_amount = receivable_amount;
    this.customerId = customerId;
    this.subcriptionPlanId = subcriptionPlanId;
    this.validate_for = validate_for;
    this.calendar_days = calendar_days;
  }
}
