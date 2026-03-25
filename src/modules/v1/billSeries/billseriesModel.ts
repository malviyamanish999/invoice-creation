import { IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator';
import { Model } from '../../../model';

export class CreateModel extends Model {
  @IsNotEmpty()
  @IsString()
  public series: string;

  @IsNotEmpty()
  @IsDateString()
  public from: Date;

  @IsNotEmpty()
  @IsDateString()
  public to: Date;

  constructor(body: any) {
    super();
    const { series, from, to } = body;

    this.series = series;
    this.from = from;
    this.to = to;
  }
}
export class UpdateModel extends Model {
  @IsOptional()
  @IsString()
  public series: string;

  @IsOptional()
  @IsDateString()
  public from: Date;

  @IsOptional()
  @IsDateString()
  public to: Date;

  constructor(body: any) {
    super();

    this.series = body?.series;
    this.from = body?.from;
    this.to = body?.to;
  }
}
