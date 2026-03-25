import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { Model } from '../../../model';

export class CreateModel extends Model {
  @IsNotEmpty()
  @IsString()
  public description: string;

  constructor(body: any) {
    super();
    const { description } = body;

    this.description = description;
  }
}
export class UpdateModel extends Model {
  @IsOptional()
  @IsString()
  public description: string;

  constructor(body: any) {
    super();

    this.description = body?.description;
  }
}
