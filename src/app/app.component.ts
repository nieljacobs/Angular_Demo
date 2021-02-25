import { Component, OnInit } from '@angular/core';

import { User } from './models/user';
import { AuthenticationService } from './services/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  
  pageTitle: string;
  currentUser: User;

  constructor(private authService: AuthenticationService) { 
    this.pageTitle = 'Pick-or-Post'
    this.currentUser = null;
  }
  
  ngOnInit(): void {
    this.authService.getCurrentUser()
    .subscribe((user: string) => {
      if (user) {
        this.currentUser = JSON.parse(user);
      }else {
        this.currentUser = null;
      }
    });  
  }
  // called on sign out button click
  signOut(): void {
    this.authService.removeCurrentUser();
  }
}
