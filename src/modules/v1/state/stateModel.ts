import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';
import { Model } from '../../../model';

export class CreateModel extends Model {
  @IsNotEmpty()
  @IsString()
  public name: string;

  @IsNumber()
  @IsNotEmpty()
  public no: number;

  constructor(body: any) {
    super();
    const { name, no } = body;

    this.name = name;
    this.no = no;
  }
}
export class UpdateModel extends Model {
  @IsOptional()
  @IsString()
  public name: string;

  @IsNumber()
  @IsOptional()
  public no: number;

  constructor(body: any) {
    super();

    this.name = body?.name;
    this.no = body?.no;
  }
}
