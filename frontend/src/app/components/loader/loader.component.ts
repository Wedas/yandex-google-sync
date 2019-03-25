import {Component} from '@angular/core';
import {LoaderService} from '../../services/loader/loader.service';

@Component({
  selector: 'app-loader',
  templateUrl: 'loader.component.html',
  styleUrls: ['./loader.component.css']
})

export class LoaderComponent {
  showAnimation = false;
  constructor(private loaderService: LoaderService) {
    this.loaderService.notify.subscribe(showAnimation => {
      this.showAnimation = showAnimation;
    });
  }
}
