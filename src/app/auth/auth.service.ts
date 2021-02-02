import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  LOCALLY_STORED_USER_DATA = 'user';
  username = null;
  isLoggedIn = new BehaviorSubject<boolean>(false);

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient) {
    this.username = this.getLoggedInUserName();
    if (this.username != null) {
      let expiry = new Date(this.getLoggedInUserExpiry()).getTime();
      let currentDate = new Date().getTime();
      // token has not yet expired
      if (expiry > currentDate) {
        this.isLoggedIn.next(true);
      } else {
        this.logout();
      }
    }
  }

  login(username: String, password: String) {
    // let token = this.createBasicAuthToken(username, password);
    return this.http.post(environment.serverUrl + "/auth/authenticate",
      {
        "username": username,
        "password": password
      }
      ).pipe(
        map((response) => {
          let user = {
            username: username,
            token: response['jwt'],
            expiry: response['expiry']
          };
          this.username = username;
          // Store user in local storage until they log out
          localStorage.setItem(this.LOCALLY_STORED_USER_DATA, JSON.stringify(user));
          this.isLoggedIn.next(true);
        })
      );
  }

  register(userName: String, password: String, matchingPassword: String): Observable<any> {
    return this.http.post(environment.serverUrl + "/auth/registerUser", {
      userName: userName,
      password: password,
      matchingPassword: matchingPassword
    }, this.httpOptions);
  }

  logout() {
    localStorage.removeItem(this.LOCALLY_STORED_USER_DATA);
    this.username = null;
    this.isLoggedIn.next(false);
  }

  isUserLoggedIn() {
    return this.username !== null || localStorage.getItem(this.LOCALLY_STORED_USER_DATA) !== null;
  }

  getLoggedInUserName(): string {
    if (this.username !== null) {
      return this.username;
    }
    let user = JSON.parse(localStorage.getItem(this.LOCALLY_STORED_USER_DATA));
    if (user === null) {
      return null;
    }
    return user.username;
  }

  getLoggedInUserToken() {
    let user = JSON.parse(localStorage.getItem(this.LOCALLY_STORED_USER_DATA));
    return user === null ? null : user.token;
  }

  getLoggedInUserExpiry() {
    let user = JSON.parse(localStorage.getItem(this.LOCALLY_STORED_USER_DATA));
    return user === null ? null : user.expiry;
  }
}
