import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/auth/auth.service';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

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

  constructor(
    private router: Router,
    private authService: AuthenticationService) { }

  ngOnInit(): void {
    this.subscriptions.push(this.authService.isLoggedIn.subscribe((isLoggedIn) => {
      this.isLoggedIn = isLoggedIn;
      console.log(isLoggedIn);
    }));
  }

  handleLogout() {
    this.authService.logout();
    //this.openDialog();
  }

  getUsername() {
    return this.authService.getLoggedInUserName();
  }



}
