import {EventEmitter, Injectable} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/internal/operators';
import {Router} from '@angular/router';
import {AlertService} from '../services/alert/alert.service';
import {NotifierService} from '../services/notifier/notifier.service';
import {AuthService} from '../services/auth/auth.service';

@Injectable()
export class ResponseInterceptor implements HttpInterceptor {

  constructor(private router: Router,
              private alertService: AlertService,
              private notifierService: NotifierService,
              private authService: AuthService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          console.log('from response interceptor', event);
        }
        return event;
      },
      (error: HttpErrorResponse) => {
        if (error.status === 403 && error.url.indexOf('localhost') !== -1) {
          this.alertService.error('Вследствие неактивности ваша сессия истекла');
          this.authService.logout();
          this.router.navigateByUrl('/auth');
        } else {
          this.alertService.error('Ошибка! ' + (error.message ? error.message : ''));
          this.notifierService.onNotify(error);
          console.log('errorResponse', HttpErrorResponse);
        }
      }));
  }
}
