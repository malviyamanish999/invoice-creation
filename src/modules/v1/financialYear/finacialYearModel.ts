import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { Model } from '../../../model';

export class CreateModel extends Model {
  @IsNotEmpty()
  @IsString()
  public year: string;

  constructor(body: any) {
    super();
    const { year } = body;

    this.year = year;
  }
}
export class UpdateModel extends Model {
  @IsOptional()
  @IsString()
  public year: string;

  constructor(body: any) {
    super();

    this.year = body?.year;
  }
}
