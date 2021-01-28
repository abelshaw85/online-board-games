import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { WebSocketService } from 'src/app/web-socket/web-socket.service';

@Component({
  selector: 'app-web-socket',
  templateUrl: './web-socket.component.html',
  styleUrls: ['./web-socket.component.css']
})
export class WebSocketComponent implements OnInit, OnDestroy {
  greeting: any;
  name: string;
  messageReceived: Subscription;
  isConnected: Subscription;
  connected: boolean = false;

  constructor(public webSocketService: WebSocketService) {}

  ngOnInit() {
    this.messageReceived = this.webSocketService.dataReceived.subscribe((message) => {
      this.greeting = message;
    });

    this.isConnected = this.webSocketService.connectedSubject.subscribe((conn) => {
      this.connected = conn;
    });
  }

  ngOnDestroy() {
    this.messageReceived.unsubscribe();
    this.isConnected.unsubscribe();
  }

  connect() {
    this.webSocketService._connect();
  }

  disconnect() {
    this.webSocketService._disconnect();
  }

  get greetingValue() {
    return this.greeting;
  }

  set greetingValue(greeting) {
    this.greeting = greeting;
  }

}
