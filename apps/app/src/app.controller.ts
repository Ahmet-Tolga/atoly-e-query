import { Controller} from '@nestjs/common';
import { AppService } from './app.service';
import { QueryDto } from './Dto/query.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern("findAll")
  async findAll(@Payload() queryDto:QueryDto){
    return await this.appService.findAll(queryDto);
  }

  @MessagePattern("test-api")
  async test(){
    return await "This is a test of microservice";
  }

  @MessagePattern("create-mock-data")
  async createMockData(){
    return await this.appService.createMockData();
  }
}
