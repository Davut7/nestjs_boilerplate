import {
  IsEnum,
  IsInt,
  IsOptional,
  Min,
  IsString,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderType, LanguageEnum } from 'src/helpers/constants';

export class PageOptionsDto {
  @IsEnum(OrderType)
  @IsOptional()
  @Type(() => String)
  readonly order: OrderType = OrderType.ASC;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  readonly page?: number;

  @IsInt()
  @Min(1)
  @IsIn([5, 10, 20, 50])
  @IsOptional()
  @Type(() => Number)
  readonly take?: number;

  @IsString()
  @IsOptional()
  readonly q?: string;

  @IsOptional()
  @IsEnum(LanguageEnum)
  readonly lng: LanguageEnum;
}
