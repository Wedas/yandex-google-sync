import {Injectable} from '@angular/core';

const YANDEX_TOKEN = 'yandexAccessToken';
const YANDEX_USER_EMAIL = 'yandexUserEmail';

@Injectable()
export class YandexUserRepository {

  saveToken(accessToken: string) {
    localStorage.setItem(YANDEX_TOKEN, accessToken);
  }

  getToken(): string {
    return localStorage.getItem(YANDEX_TOKEN);
  }

  clearToken() {
    localStorage.removeItem(YANDEX_TOKEN);
  }

  saveUserEmail(email: string) {
    localStorage.setItem(YANDEX_USER_EMAIL, email);
  }

  getUserEmail(): string {
    return localStorage.getItem(YANDEX_USER_EMAIL);
  }

  clearUserEmail() {
    localStorage.removeItem(YANDEX_USER_EMAIL);
  }

  getYandexUser() {
    return {
      accessToken: this.getToken(),
      email: this.getUserEmail()
    };
  }
}
