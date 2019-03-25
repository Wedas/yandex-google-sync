import {Injectable} from '@angular/core';

const GOOGLE_ACCESS_TOKEN = 'googleAccessToken';
const GOOGLE_REFRESH_TOKEN = 'googleRefreshToken';
const GOOGLE_ACCESS_TOKEN_EXPIRATION = 'googleAccessTokenExpiration';
const GOOGLE_USER_EMAIL = 'googleUserEmail';

@Injectable()
export class GoogleUserRepository {

  saveAccessToken(accessToken: string, expiration: number) {
    localStorage.setItem(GOOGLE_ACCESS_TOKEN, accessToken);
    localStorage.setItem(GOOGLE_ACCESS_TOKEN_EXPIRATION, expiration.toString());
  }

  getAccessToken(): string {
    return localStorage.getItem(GOOGLE_ACCESS_TOKEN);
  }

  getAccessTokenExpiration(): string {
    return localStorage.getItem(GOOGLE_ACCESS_TOKEN_EXPIRATION);
  }

  saveRefreshToken(refreshToken: string) {
    localStorage.setItem(GOOGLE_REFRESH_TOKEN, refreshToken);
  }

  getRefreshToken(): string {
    return localStorage.getItem(GOOGLE_REFRESH_TOKEN);
  }

  clearAccessToken() {
    localStorage.removeItem(GOOGLE_ACCESS_TOKEN);
    localStorage.removeItem(GOOGLE_ACCESS_TOKEN_EXPIRATION);
  }

  clearRefreshToken() {
    localStorage.removeItem(GOOGLE_REFRESH_TOKEN);
  }

  saveUserEmail(email: string) {
    localStorage.setItem(GOOGLE_USER_EMAIL, email);
  }

  getUserEmail(): string {
    return localStorage.getItem(GOOGLE_USER_EMAIL);
  }

  clearUserEmail() {
    localStorage.removeItem(GOOGLE_USER_EMAIL);
  }

}
