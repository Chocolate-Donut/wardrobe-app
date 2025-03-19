import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateOutfitDto {
  @IsString()
  title: string;

  @IsString()
  imageUrl: string;

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsString()
  season: string;

  @IsString()
  trend: string;
}
