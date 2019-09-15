import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {YandexUserRepository} from '../../infrastructure/repositories/yandex/yandex.user.repository';
import {Observable} from 'rxjs';

const LIST_FILES_URL = 'https://cloud-api.yandex.net/v1/disk/resources/files';
const REQUEST_UPLOAD_URL = 'https://cloud-api.yandex.net/v1/disk/resources/upload?path=';
const DELETE_FILE_URL = 'https://cloud-api.yandex.net/v1/disk/resources?path=';

@Injectable()
export class YandexService {

  client_id = 'xxx';
  yandex_auth_url = 'https://passport.yandex.ru/auth/list?' +
    'retpath=https%3A%2F%2Foauth.yandex.ru%2Fauthorize%3Fresponse_type%3Dtoken%26' +
    'client_id=' + this.client_id + '&origin=oauth&mode=edit';

  constructor(private http: HttpClient,
              private yandexUser: YandexUserRepository) {
  }

  signIn(): Promise<any> {
    return new Promise((resolve, reject) => {
      const thisService = this;

      function checkYandexWindow(child) {
        try {
          if (child.location.host === 'localhost:4200' || child.location.host === 'localhost:4200/home') {
            const accessToken = /access_token=([^&]+)/.exec(child.location.hash)[1];
            child.close();
            clearInterval(timer);
            if (accessToken) {
              thisService.yandexUser.saveToken(accessToken);
              thisService.http.get<any>('https://login.yandex.ru/info?oauth_token='
                + thisService.yandexUser.getToken()).subscribe(userInfo => {
                thisService.saveUserEmail(userInfo.default_email);
                thisService.saveYandexUserToDB();
                resolve();
              });
            }
          }
        } catch (e) {
        }
      }

      const yandexAuthWindow = window.open(this.yandex_auth_url,
        '_blank',
        'left=100,top=10,width=400,height=500');
      const timer = setInterval(function () {
        checkYandexWindow(yandexAuthWindow);
      }, 500);
    });
  }

  signOut() {
    this.yandexUser.clearToken();
    this.yandexUser.clearUserEmail();
    this.http.delete('/deleteYandexUser').subscribe();
  }

  listFiles(): Observable<any> {
    return this.http.get(LIST_FILES_URL, {
      headers: new HttpHeaders().set('Authorization', 'OAuth ' + this.yandexUser.getToken())
    });
  }

  isSignedIn(): boolean {
    return this.yandexUser.getToken() !== null && this.yandexUser.getToken() !== undefined;
  }

  requestUploadUrl(filename): Observable<any> {
    return this.http.get(REQUEST_UPLOAD_URL + filename + '&overwrite=true', {
      headers: new HttpHeaders().set('Authorization', 'OAuth ' + this.yandexUser.getToken())
    });
  }

  uploadFile(url, blobFile) {
    return this.http.put(url, blobFile);
  }

  downloadFile(file): Observable<any> {
    return this.http.get(file.file,
      {responseType: 'blob'});
  }

  deleteFile(filePath): Observable<any> {
    return this.http.delete(DELETE_FILE_URL + filePath + '&permanently=true', {
      headers: new HttpHeaders().set('Authorization', 'OAuth ' + this.yandexUser.getToken())
    });
  }

  saveUserEmail(email: string) {
    this.yandexUser.saveUserEmail(email);
  }

  getUserEmail(): string {
    return this.yandexUser.getUserEmail();
  }

  saveYandexUserToStorage(yandexUser) {
    if (yandexUser) {
      if (yandexUser.email) {
        this.saveUserEmail(yandexUser.email);
      }
      if (yandexUser.accessToken) {
        this.yandexUser.saveToken(yandexUser.accessToken);
      }
    }
  }

  saveYandexUserToDB() {
    this.http.post('/saveYandexUserToDB', this.yandexUser.getYandexUser()).subscribe();
  }

  showUserProfile() {
    console.log('show user profile');
  }

  getYandexUsers() {
    console.log('getYandexUsers');
  }
}
