import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { Model } from '../../../model';

export class CreateModel extends Model {
  @IsNotEmpty()
  @IsString()
  public name: string;

  constructor(body: any) {
    super();
    const { name } = body;

    this.name = name;
  }
}
export class UpdateModel extends Model {
  @IsOptional()
  @IsString()
  public name: string;

  constructor(body: any) {
    super();

    this.name = body?.name;
  }
}
