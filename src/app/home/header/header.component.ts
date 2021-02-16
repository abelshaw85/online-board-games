import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/auth/auth.service';
import { faSignOutAlt, faUser } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  greeting = {};
  isLoggedIn: boolean;
  subscriptions: Subscription[] = [];
  faLogout = faSignOutAlt;
  faUser = faUser;

  constructor(
    private authService: AuthenticationService) { }

  ngOnInit(): void {
    this.subscriptions.push(this.authService.isLoggedIn.subscribe((isLoggedIn) => {
      this.isLoggedIn = isLoggedIn;
    }));
  }

  handleLogout() {
    this.authService.logout();
  }

  getUsername() {
    return this.authService.getLoggedInUserName();
  }
}
