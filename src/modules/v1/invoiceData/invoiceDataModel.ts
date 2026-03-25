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

  constructor(body: any) {
    super();
    const { subcription_type } = body;
    const { rate } = body;
    const { descriptionId } = body;
    const { total_amount } = body;
    const { receivable_amount } = body;
    const { customerId } = body;
    const { subcriptionPlanId } = body;

    this.subcription_type = subcription_type;
    this.rate = rate;
    this.descriptionId = descriptionId;
    this.total_amount = total_amount;
    this.receivable_amount = receivable_amount;
    this.customerId = customerId;
    this.subcriptionPlanId = subcriptionPlanId;
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

  constructor(body: any) {
    super();
    const { subcription_type, rate, descriptionId, total_amount, receivable_amount, customerId, subcriptionPlanId } =
      body;

    this.subcription_type = subcription_type;
    this.rate = rate;
    this.descriptionId = descriptionId;
    this.total_amount = total_amount;
    this.receivable_amount = receivable_amount;
    this.customerId = customerId;
    this.subcriptionPlanId = subcriptionPlanId;
  }
}
