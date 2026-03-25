import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { Model } from '../../../model';

export class CreateModel extends Model {
  @IsNotEmpty()
  @IsString()
  public type: string;

  constructor(body: any) {
    super();
    const { type } = body;

    this.type = type;
  }
}
export class UpdateModel extends Model {
  @IsOptional()
  @IsString()
  public type: string;

  constructor(body: any) {
    super();

    this.type = body?.type;
  }
}
