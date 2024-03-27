import { Injectable } from '@nestjs/common';
import * as mqtt from 'mqtt';
import { CounterGateway } from 'src/counter/counter.gateway';

@Injectable()
export class MqttService {
  private client: any;

  constructor(gateway: CounterGateway) {
    const options: mqtt.IClientOptions = {
      clientId: 'typescript-client',
    };
    this.client = mqtt.connect('mqtt://localhost', options); // Replace with your MQTT broker URL

    // console.log("---")

    this.client.on('connect', () => {
      this.client.subscribe('color/sender');
      this.client.on('message', function(topic, message){
        console.log(topic);
        // console.log(message.toString());
        gateway.updateColorCounter(message.toString());
      });
    });
  }
}
