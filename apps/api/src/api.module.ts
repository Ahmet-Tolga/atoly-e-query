import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import * as dotenv from "dotenv";

@Module({
  imports: [ClientsModule.register([{
    name:"QUERY_SERVICE",
    transport:Transport.RMQ,
    options:{
      urls:['amqp://admin:password@localhost:5672'],
      queue:"query_queue",
      queueOptions:{
        durable:false
      }
    }
  }])],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
