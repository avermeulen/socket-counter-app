import {
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

const users = {};
const colors = {};

@WebSocketGateway()
export class CounterGateway implements OnGatewayConnection {
  handleConnection(client: any) {
    // throw new Error('Method not implemented.');
    client.emit('messageReceived', {
      counter: this.counter,
    });
    if (!users[client.id]) {
      client.emit('disable', {});
    }
  }

  @WebSocketServer()
  server: Server;

  private counter: number = 0;

  @SubscribeMessage('login')
  handleLogin(client: Socket, payload: any): void {
    const { username } = payload;
    if (username) {
      users[client.id] = username;
      client.emit('enable', {});
    }
  }

  @SubscribeMessage('joinColor')
  handleJoinColor(client: Socket, payload: any) {
    const { color } = payload;
    if (color) {
      client.join(color);
    }
  }

  @SubscribeMessage('leaveColor')
  handleLeaveColor(client: Socket, payload: any) {
    const { color } = payload;
    if (color) {
      client.leave(color);
    }
  }

  @SubscribeMessage('sendColor')
  sendColor(client: Socket, payload: any) {
    const { color } = payload;
    if (color) {
      const count = colors[color];
      const colorCount = count ? count : 0;
      colors[color] = colorCount + 1;
      this.sendCounterToRoom(color);
    }
  }

  @SubscribeMessage('color')
  handleColor(client: Socket, payload: any) {
    const { command, color } = payload;
    if (color) {
      if (command == 'update') {
        const count = colors[color];
        const colorCount = count ? count : 0;
        colors[color] = colorCount + 1;
        this.sendCounterToRoom(color);
      }
      this.sendCounterToRoom(color);
    }
  }

  public updateColorCounter(color) {
    if (color) {
      const count = colors[color];
      const colorCount = count ? count : 0;
      colors[color] = colorCount + 1;
      this.sendCounterToRoom(color);
    }
  }

  sendCounterToRoom(color) {
    const count = colors[color];
    const colorCount = count ? count : 0;
    this.server.to(color).emit('colorInfo', {
      color,
      count: colorCount,
    });
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: any): void {
    const { command } = payload;
    if (!users[client.id]) {
      return;
    }

    if (command == 'plus') {
      this.counter++;
    } else if (command == 'minus') {
      if (this.counter > 0) {
        this.counter--;
      }
    }
    this.server.emit('messageReceived', {
      counter: this.counter,
    });
  }
}
