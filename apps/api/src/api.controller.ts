import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { ApiService } from './api.service';
import { ClientProxy } from '@nestjs/microservices';
import { QueryDto } from 'apps/app/src/Dto/query.dto';

@Controller("test")
export class ApiController {
  constructor(@Inject("QUERY_SERVICE") private readonly query_client:ClientProxy) {};
  

  @Get("/findall")
  async findAll(@Body() query:QueryDto){
    return await this.query_client.send("findAll",query).toPromise();
  }

  @Post("/create")
  async createMockData(){
    return await this.query_client.send("create-mock-data",{}).toPromise();
  }
  
}
