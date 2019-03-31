import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { map } from 'rxjs/operators';
import {YandexService} from '../yandex/yandex.service';
import {GoogleService} from '../google/google.service';

@Injectable()
export class AuthService {

  currentUser = 'currentUser';

  constructor(private http: HttpClient,
              private yandexService: YandexService,
              private googleService: GoogleService) { }

  login(username: string, password: string) {
    return this.http.get<any>(`/login`,  {
      headers: new HttpHeaders().set('Authorization', 'Basic ' + btoa(username + ':' + password))
    }).pipe(map(user => {
        if (user) {
          localStorage.setItem(this.currentUser, JSON.stringify(user));
          this.yandexService.saveYandexUserToStorage(user.yandexUser);
          this.googleService.saveGoogleUser(user.googleUser);
        }
        return user;
      }));
  }

  logout() {
    localStorage.clear();
    this.http.get<any>('/logout').subscribe();
  }

  isSignedIn (): boolean {
    return !!localStorage.getItem(this.currentUser);
  }

  getUserName() {
    return localStorage.getItem(this.currentUser) ? JSON.parse(localStorage.getItem(this.currentUser)).email : '';
  }
}
