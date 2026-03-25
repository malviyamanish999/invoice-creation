import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';
import { Model } from '../../../model';

export class CreateModel extends Model {
  @IsNotEmpty()
  @IsString()
  public type: string;

  @IsNotEmpty()
  @IsNumber()
  public rate: number;

  constructor(body: any) {
    super();
    const { type, rate } = body;

    this.type = type;
    this.rate = rate;
  }
}
export class UpdateModel extends Model {
  @IsOptional()
  @IsString()
  public type: string;

  @IsOptional()
  @IsNumber()
  public rate: number;

  constructor(body: any) {
    super();

    this.type = body?.type;
    this.rate = body?.rate;
  }
}
