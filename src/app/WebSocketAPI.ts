import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { WebSocketComponent } from './web-socket/web-socket/web-socket.component';
import { Subject } from 'rxjs';

export class WebSocketAPI {

  webSocketEndPoint: string = 'http://localhost:8080/ws';
  topic: string = "/topic/greetings";
  board: string = "/topic/board";
  stompClient: any;
  webSocketComponent: WebSocketComponent;
  messageReceived = new Subject<string>();

  constructor(webSocketComponent: WebSocketComponent) {
      this.webSocketComponent = webSocketComponent;
  }

  _connect() {
      console.log("Initialize WebSocket Connection");
      let ws = new SockJS(this.webSocketEndPoint);
      this.stompClient = Stomp.over(ws);
      const _this = this;
      _this.stompClient.connect({}, function (frame) {
          _this.stompClient.subscribe(_this.board, function (sdkEvent) {
              _this.onMessageReceived(sdkEvent);
          });
          //_this.stompClient.reconnect_delay = 2000;
      }, this.errorCallBack);
  };

  _disconnect() {
      if (this.stompClient !== null) {
          this.stompClient.disconnect();
      }
      console.log("Disconnected");
  }

  // on error, schedule a reconnection attempt
  errorCallBack(error) {
      console.log("errorCallBack -> " + error)
      setTimeout(() => {
          this._connect();
      }, 5000);
  }

/**
* Send message to sever via web socket
* @param {*} message
*/
  _send(message) {
      console.log("calling logout api via web socket");
      this.stompClient.send("/app/hello", {}, JSON.stringify(message));
  }

  _sendBoardRequest(message) {
    console.log("calling logout api via web socket");
    this.stompClient.send("/app/boardplz", {}, JSON.stringify(message));
}

  onMessageReceived(message) {
      console.log("Message Recieved from Server :: " + message);
      //this.webSocketComponent.handleMessage(JSON.stringify(message.body));
      //this.messageReceived.next(JSON.parse(message.body)["content"]); //convert to JSON, get "content" attribute
  }
}
