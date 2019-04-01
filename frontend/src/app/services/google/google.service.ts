import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {GoogleUserRepository} from '../../infrastructure/repositories/google/google.user.repository';
import {concatMap} from 'rxjs/internal/operators';

const FILES_URL = 'https://www.googleapis.com/drive/v2/files/';
const UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=media';
const RENAME_FILE_URL = 'https://www.googleapis.com/drive/v3/files/';
const USER_INFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo?alt=json';

@Injectable()
export class GoogleService {

  client_id = 'xxx';
  client_secret = 'xxx';
  googleCodeUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' +
    'scope=https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/userinfo.email&' +
    'access_type=offline&' +
    'redirect_uri=http://localhost:4200&' +
    'response_type=code&' +
    'client_id=' + this.client_id;
  googleTokenUrl = 'https://www.googleapis.com/oauth2/v3/token';

  constructor(private http: HttpClient,
              public googleUser: GoogleUserRepository) {
  }

  signIn(): Promise<any> {
    return new Promise((resolve, reject) => {
      const thisService = this;

      function checkGoogleWindow(child) {
        try {
          if (child.location.host === 'localhost:4200' || child.location.host === 'localhost:4200/home') {
            const code = /code=([^&]+)/.exec(child.location.href)[1];
            clearInterval(timer);
            child.close();
            const requestBody = 'code=' + code + '&' +
              'client_id=' + thisService.client_id + '&' +
              'client_secret=' + thisService.client_secret + '&' +
              'redirect_uri=http://localhost:4200&' +
              'grant_type=authorization_code';
            thisService.http.post<any>(thisService.googleTokenUrl, requestBody, {
              headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
            }).subscribe(response => {
              const currentDate = new Date();
              const tokenExpirationDate = currentDate.setSeconds(currentDate.getSeconds() + parseInt(response.expires_in, 10));
              thisService.googleUser.saveAccessToken(response.access_token, tokenExpirationDate);
              thisService.googleUser.saveRefreshToken(response.refresh_token);
              thisService.http.get<any>(USER_INFO_URL, {
                headers: new HttpHeaders().set('Authorization', 'Bearer ' + thisService.googleUser.getAccessToken())
              }).subscribe(userInfo => {
                thisService.saveUserEmail(userInfo.email);
                thisService.saveGoogleUserToDB();
                resolve();
              });
            });
          }
        } catch (e) {
        }
      }

      const googleAuthWindow = window.open(this.googleCodeUrl,
        '_blank',
        'left=100,top=10,width=400,height=500');
      const timer = setInterval(function () {
        checkGoogleWindow(googleAuthWindow);
      }, 500);
    });
  }

  signOut() {
    this.googleUser.clearAccessToken();
    this.googleUser.clearRefreshToken();
    this.googleUser.clearUserEmail();
    this.deleteGoogleUserFromDB();
  }

  listFiles(): Observable<any> {
    return this.checkAccessTokenValid().pipe(concatMap(() => {
      return this.http.get(FILES_URL, {
        headers: new HttpHeaders().set('Authorization', 'Bearer ' + this.googleUser.getAccessToken())
      });
    }));
  }

  isSignedIn(): boolean {
    return this.googleUser.getAccessToken() !== null && this.googleUser.getAccessToken() !== undefined;
  }

  downloadFile(file): Observable<any> {
    return this.checkAccessTokenValid().pipe(concatMap(() => {
      return this.http.get(FILES_URL + file.id + '?alt=media',
        {
          headers: new HttpHeaders().set('Authorization', 'Bearer ' + this.googleUser.getAccessToken()),
          responseType: 'blob'
        });
    }));
  }

  uploadFile(mimeType, blob): Observable<any> {
    return this.checkAccessTokenValid().pipe(concatMap(() => {
      return this.http.post(UPLOAD_URL, blob,
        {
          headers: new HttpHeaders()
            .set('Content-Type', mimeType)
            .set('Authorization', 'Bearer ' + this.googleUser.getAccessToken())
        });
    }));
  }

  renameFile(fileId, fileName): Observable<any> {
    return this.checkAccessTokenValid().pipe(concatMap(() => {
      return this.http.patch(RENAME_FILE_URL + fileId, {name: fileName},
        {
          headers: new HttpHeaders()
            .set('Authorization', 'Bearer ' + this.googleUser.getAccessToken())
        });
    }));
  }

  deleteFile(fileId): Observable<any> {
    return this.checkAccessTokenValid().pipe(concatMap(() => {
      return this.http.delete(FILES_URL + fileId, {
        headers: new HttpHeaders()
          .set('Authorization', 'Bearer ' + this.googleUser.getAccessToken())
      });
    }));
  }

  reauth(): Promise<any> {
    const requestBody = 'grant_type=refresh_token&' +
      'client_id=' + this.client_id + '&' +
      'client_secret=' + this.client_secret + '&' +
      'refresh_token=' + this.googleUser.getRefreshToken();
    return new Promise<any>((resolve, reject) => {
      this.http.post<any>(this.googleTokenUrl, requestBody, {
        headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
      }).subscribe(response => {
        const currentDate = new Date();
        const tokenExpirationDate = currentDate.setSeconds(currentDate.getSeconds() + parseInt(response.expires_in, 10));
        this.googleUser.saveAccessToken(response.access_token, tokenExpirationDate);
        this.saveGoogleUserToDB();
        resolve();
      }, error => {
        this.signOut();
        resolve();
      });
    });
  }

  checkAccessTokenValid(): Observable<any> {
    return new Observable<any>(observer => {
      let accessTokenExpirationDate = new Date(parseInt(this.googleUser.getAccessTokenExpiration() || '0', 10));
      accessTokenExpirationDate = new Date(accessTokenExpirationDate
        .setSeconds(accessTokenExpirationDate.getSeconds() - 60));
      if (accessTokenExpirationDate < new Date()) {
        console.log('sending expiration');
        console.log('accessTokenExpirationDate', accessTokenExpirationDate);
        this.reauth().then(() => {
          console.log('end reauth');
          observer.next();
          observer.complete();
        });
      } else {
        console.log('not expired');
        console.log('parseInt(this.googleUser.getAccessTokenExpiration(), 10)', parseInt(this.googleUser.getAccessTokenExpiration(), 10));
        console.log('accessTokenExpirationDate', accessTokenExpirationDate);
        console.log('new Date', new Date());
        observer.next();
        observer.complete();
      }
    });
  }

  saveUserEmail(email: string) {
    this.googleUser.saveUserEmail(email);
  }

  getUserEmail(): string {
    return this.googleUser.getUserEmail();
  }

  saveGoogleUser(googleUser) {
    if (googleUser) {
      if (googleUser.accessToken && googleUser.accessTokenExpiration) {
        this.googleUser
          .saveAccessToken(googleUser.accessToken, new Date(googleUser.accessTokenExpiration).getTime());
      }
      if (googleUser.refreshToken) {
        this.googleUser.saveRefreshToken(googleUser.refreshToken);
      }
      if (googleUser.email) {
        this.saveUserEmail(googleUser.email);
      }
    }
  }

  saveGoogleUserToDB() {
    this.http.post('/saveGoogleUserToDB', this.googleUser.getGoogleUser()).subscribe();
  }

  deleteGoogleUserFromDB() {
    this.http.delete('/deleteGoogleUser').subscribe();
  }
}
