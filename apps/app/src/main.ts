import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from "dotenv";

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule,{
    transport:Transport.RMQ,
    options:{
      urls: [`amqp://${process.env.RABBITMQ_USERNAME}:${process.env.RABBITMQ_PASSWORD}@localhost:5672`],
      queue: 'query_queue',
      queueOptions: {
        durable: false
      }
    }
  })

  app.useGlobalPipes(new ValidationPipe());
  await app.listen();
  console.log("Microservice is running for All!");
}
bootstrap();
