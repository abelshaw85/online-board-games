import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { BehaviorSubject, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { AuthenticationService } from '../auth/auth.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class WebSocketService {

  webSocketEndPoint: string = environment.serverUrl + "/ws";
  topic: string = "/topic/greetings";
  topicTest: string = "/topic/test";
  stompClient: any;
  dataReceived = new Subject<string>();
  turnReceived = new Subject<any>();
  connectedSubject = new BehaviorSubject<boolean>(false); //BehaviourSubject keeps track of last result, unlike Subject

  constructor(private authenticationService: AuthenticationService) {}

  _connect() {
    console.log("Initialize WebSocket Connection");
    if (this.authenticationService.isUserLoggedIn()) {
      let ws = new SockJS(this.webSocketEndPoint);
      this.stompClient = Stomp.over(ws);
      const _this = this;
      _this.stompClient.connect({
        'Authorization': "Bearer " + this.authenticationService.getLoggedInUserToken(),
        'username': this.authenticationService.getLoggedInUserName()
      }, function (frame) {
        _this.connectedSubject.next(true);
        _this.stompClient.subscribe(_this.topicTest, function (data) {
            _this.onDataReceived(data);
        });
      }, this.errorCallBack);
    } else {
      console.log("Unable to connect: must be logged in.");
    }
  }

  _disconnect() {
    if (this.stompClient !== null) {
      this.stompClient.disconnect();
      this.stompClient = null;
    }
  }

  // on error, schedule a reconnection attempt
  errorCallBack(error) {
    console.log("errorCallBack -> " + error);
    this.connectedSubject.next(false);
    var self = this;
    setTimeout(() => {
        this._connect();
    }, 5000);
  }

  onDataReceived(data) {
    let body = JSON.parse(data.body);
    if (body['type'] == "TurnEmit") {
      let turnData = body['data'];
      this.turnReceived.next(turnData);
    }
    // other websocket data types go here
  }

  test() {
    this.stompClient.send("/app/test", {}, JSON.stringify("Hello"));
  }
}
