import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { WebSocketAPI } from 'src/app/WebSocketAPI';

@Component({
  selector: 'app-web-socket',
  templateUrl: './web-socket.component.html',
  styleUrls: ['./web-socket.component.css']
})
export class WebSocketComponent implements OnInit {
  webSocketAPI: WebSocketAPI;
  greeting: any;
  name: string;
  messageReceived: Subscription;

  ngOnInit() {
    this.webSocketAPI = new WebSocketAPI(new WebSocketComponent());
    this.messageReceived = this.webSocketAPI.messageReceived.subscribe((message) => {
      this.greeting = message;
    });
  }

  connect() {
    this.webSocketAPI._connect();
  }

  disconnect() {
    this.webSocketAPI._disconnect();
  }

  sendMessage() {
    this.webSocketAPI._send(this.name);
  }

  sendBoardRequest() {
    this.webSocketAPI._sendBoardRequest(this.name);
  }

  handleMessage(message) {
    console.log("handling message...");
    console.log(message);
    this.greeting = message;
    console.log(this.greeting);
  }

  get greetingValue() {
    return this.greeting;
  }

  set greetingValue(greeting) {
    this.greeting = greeting;
  }

}
