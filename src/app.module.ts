import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CounterGateway } from './counter/counter.gateway';
import { MqttService } from './mqtt/mqtt.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, CounterGateway, MqttService],
})
export class AppModule {}
