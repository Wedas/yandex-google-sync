import {EventEmitter, Injectable} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/internal/operators';
import {Router} from '@angular/router';
import {AlertService} from '../services/alert/alert.service';
import {NotifierService} from '../services/notifier/notifier.service';

@Injectable()
export class ResponseInterceptor implements HttpInterceptor {

  constructor(private router: Router,
              private alertService: AlertService,
              private notifierService: NotifierService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          console.log('from response interceptor', event);
        }
        return event;
      },
      (error: HttpErrorResponse) => {
        // this.router.navigateByUrl('/home');
        this.alertService.error('Ошибка! ' + (error.message ? error.message : ''));
        this.notifierService.onNotify(error);
        console.log('errorResponse', HttpErrorResponse);
      }));
  }
}
