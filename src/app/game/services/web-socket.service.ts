import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { BehaviorSubject, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { AuthenticationService } from '../../auth/auth.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  webSocketEndPoint: string = environment.serverUrl + "/ws";
  topic: string = "/topic/greetings";
  topicTest: string = "/topic/test";
  stompClient: any;
  dataReceived = new Subject<string>();
  turnReceived = new Subject<any>();
  connectedSubject = new BehaviorSubject<boolean>(false); //BehaviourSubject keeps track of last result, unlike Subject

  constructor(private authService: AuthenticationService) {}

  _connect() {
    console.log("Initialize WebSocket Connection");
    if (this.authService.isUserLoggedIn()) {
      let ws = new SockJS(this.webSocketEndPoint);
      this.stompClient = Stomp.over(ws);
      const _this = this;
      _this.stompClient.connect({
        'Authorization': "Bearer " + this.authService.getLoggedInUserToken(),
        'username': this.authService.getLoggedInUserName()
      }, function (frame) {
        _this.connectedSubject.next(true);
        _this.stompClient.subscribe(_this.topicTest, function (data) {
            _this.onDataReceived(data);
        });
      }, this.errorCallBack);
      _this.stompClient.onclose = function() {
        this.connectedSubject.next(false);
      };
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
  }
}
