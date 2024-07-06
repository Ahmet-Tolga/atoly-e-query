import {IsNotEmpty, IsOptional, IsString} from "class-validator";

export class QueryDto {
    @IsString()
    @IsNotEmpty()
    tableName:string;
    
    @IsOptional()
    columnNames?: string[];

    @IsOptional()
    where?: {
      [key: string]: {
        operator: string;
        value: any;
      };
    };
  }
  