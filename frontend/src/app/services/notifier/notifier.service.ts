import {Subject} from 'rxjs';
import {Injectable} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';

@Injectable()
export class NotifierService {
  notify: Subject<HttpErrorResponse> = new Subject<HttpErrorResponse>();
  onNotify(event) {
    this.notify.next(event);
  }
}
