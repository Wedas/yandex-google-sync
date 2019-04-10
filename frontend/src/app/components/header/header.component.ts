import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(private router: Router,
              private authService: AuthService) {
  }

  ngOnInit() {}

  isSignedIn() {
    return this.authService.isSignedIn();
  }

  signOut() {
    this.authService.logout();
    this.router.navigateByUrl('/auth');
  }

  getUserName() {
    return this.authService.getUserName();
  }
}
