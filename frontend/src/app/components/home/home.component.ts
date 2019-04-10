import {Component, OnInit} from '@angular/core';
import {YandexService} from '../../services/yandex/yandex.service';
import {GoogleService} from '../../services/google/google.service';
import {concatMap} from 'rxjs/operators';
import {forkJoin} from 'rxjs';
import {AlertService} from '../../services/alert/alert.service';
import {NotifierService} from '../../services/notifier/notifier.service';
import {LoaderService} from '../../services/loader/loader.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  googleFiles = [];
  yandexFiles = [];
  selectedGoogleFiles = [];
  selectedYandexFiles = [];
  signOutGoogleVar = false;

  constructor(public googleService: GoogleService,
              public yandexService: YandexService,
              private alertService: AlertService,
              private notifierService: NotifierService,
              private loaderService: LoaderService) {
    this.notifierService.notify.subscribe(result => {
      this.update();
    });
  }

  signInGoogle() {
    this.googleService.signIn().then(() => {
        this.loadGoogleFiles();
      },
      (error) => {
        this.alertService.error('Ошибка! ' + error.message);
      });
  }

  signOutGoogle() {
    this.signOutGoogleVar = true;
    this.googleService.signOut();
    this.selectedGoogleFiles = [];
    this.googleFiles = [];
    const thisComponent = this;
    setTimeout(function () {
      (<HTMLImageElement>document.getElementById('googleSignOutURL'))
        .src = 'https://www.google.com/accounts/Logout?' + Date.now();
      thisComponent.signOutGoogleVar = false;
    }, 500);
  }

  signInYandex() {
    this.yandexService.signIn().then(() => {
      this.loadYandexFiles();
    });
  }

  signOutYandex() {
    this.yandexService.signOut();
    this.yandexFiles = [];
    this.selectedYandexFiles = [];
  }

  loadGoogleFiles() {
    this.loaderService.onNotify(true);
    this.googleService.listFiles().subscribe(response => {
      if (response.items && response.items.length) {
        this.googleFiles = response.items.filter(file => {
          return file.fileSize > 0;
        });
        this.googleFiles.forEach(file => {
          file.created = new Date(Date.parse(file.createdDate)).toLocaleDateString('ru-RU');
        });
        this.googleFiles.sort(function (a, b) {
          if (a.title > b.title) {
            return 1;
          }
          if (a.title < b.title) {
            return -1;
          }
          return 0;
        });
      }
      this.loaderService.onNotify(false);
    });
  }

  loadYandexFiles() {
    this.loaderService.onNotify(true);
    this.yandexService.listFiles().subscribe(response => {
      if (response.items && response.items.length) {
        this.yandexFiles = response.items;
        this.yandexFiles.forEach(file => {
          file.created = new Date(Date.parse(file.created)).toLocaleDateString('ru-RU');
        });
        this.yandexFiles.sort(function (a, b) {
          if (a.name > b.name) {
            return 1;
          }
          if (a.name < b.name) {
            return -1;
          }
          return 0;
        });
      }
      this.loaderService.onNotify(false);
    });
  }

  ngOnInit() {
    if (this.googleService.isSignedIn()) {
      this.loadGoogleFiles();
    }

    if (this.yandexService.isSignedIn()) {
      this.loadYandexFiles();
    }
  }

  selectYandexFiles(yandexFile) {
    const index = this.selectedYandexFiles.indexOf(yandexFile);
    if (index > -1) {
      this.selectedYandexFiles.splice(index, 1);
    } else {
      this.selectedYandexFiles.push(yandexFile);
    }
  }

  selectGoogleFiles(googleFile) {
    const index = this.selectedGoogleFiles.indexOf(googleFile);
    if (index > -1) {
      this.selectedGoogleFiles.splice(index, 1);
    } else {
      this.selectedGoogleFiles.push(googleFile);
    }
  }

  sendGoogleFilesToYandexDisk() {
    this.loaderService.onNotify(true);
    const observables = [];
    for (const googleFile of this.selectedGoogleFiles) {
      if (this.yandexFiles.filter(yandexFile => yandexFile.name === googleFile.title).length > 0) {
        this.alertService.info('Файл с именем ' + googleFile.title + ' уже есть на Яндекс.Диске');
        continue;
      }
      observables.push(this.googleService.downloadFile(googleFile).pipe(concatMap(googleBlobFile => {
        return this.yandexService.requestUploadUrl(googleFile.title).pipe(concatMap(uploadUrl => {
          return this.yandexService.uploadFile(uploadUrl.href, googleBlobFile);
        }));
      })));
    }
    if (observables.length === 0) {
      this.loaderService.onNotify(false);
      return;
    }
    forkJoin(observables).subscribe(result => {
      this.update();
      this.alertService.success('Файлы успешно переданы');
      this.loaderService.onNotify(false);
    });
  }

  sendYandexFilesToGoogleDrive() {
    this.loaderService.onNotify(true);
    const observables = [];
    for (const yandexFile of this.selectedYandexFiles) {
      if (this.googleFiles.filter(googleFile => googleFile.title === yandexFile.name).length > 0) {
        this.alertService.info('Файл с именем ' + yandexFile.name + ' уже есть на Google Drive');
        continue;
      }
      observables.push(this.yandexService.downloadFile(yandexFile).pipe(concatMap(yandexBlobFile => {
        return this.googleService.uploadFile(yandexFile.mime_type, yandexBlobFile)
          .pipe(concatMap(googleResponse => {
            console.log('googleUploadResponse', googleResponse);
            const googleCreatedFileId = googleResponse.id;
            return this.googleService.renameFile(googleCreatedFileId, yandexFile.name);
          }));
      })));
    }
    if (observables.length === 0) {
      this.loaderService.onNotify(false);
      return;
    }
    forkJoin(observables).subscribe(result => {
      this.update();
      this.alertService.success('Файлы успешно переданы');
      this.loaderService.onNotify(false);
    });
  }

  update() {
    if (this.googleService.isSignedIn()) {
      this.loadGoogleFiles();
    } else {
      this.googleFiles = [];
    }
    if (this.yandexService.isSignedIn()) {
      this.loadYandexFiles();
    } else {
      this.googleFiles = [];
    }
    this.selectedGoogleFiles = [];
    this.selectedYandexFiles = [];
  }

  deleteSelectedFiles() {
    this.loaderService.onNotify(true);
    const observables = [];
    for (const googleFile of this.selectedGoogleFiles) {
      observables.push(this.googleService.deleteFile(googleFile.id));
    }
    for (const yandexFile of this.selectedYandexFiles) {
      observables.push(this.yandexService.deleteFile(encodeURIComponent(yandexFile.path)));
    }
    forkJoin(observables).subscribe(result => {
      this.update();
      this.alertService.success('Файлы удалены');
      this.loaderService.onNotify(false);
    });
  }

  synchronizeFiles() {
    this.loaderService.onNotify(true);
    // Формируем массив файлов Яндекса, которых нет на Google
    const yandexFilesToSend = this.yandexFiles.filter(yandexFile => {
      let isUnique = true;
      for (const googleFile of this.googleFiles) {
        if (yandexFile.name === googleFile.title) {
          isUnique = false;
          break;
        }
      }
      return isUnique;
    });
    // Формируем массив файлов Google, которых нет на Яндексе
    const googleFilesToSend = this.googleFiles.filter(googleFile => {
      let isUnique = true;
      for (const yandexFile of this.yandexFiles) {
        if (yandexFile.name === googleFile.title) {
          isUnique = false;
          break;
        }
      }
      return isUnique;
    });
    if (yandexFilesToSend.length === 0 && googleFilesToSend.length === 0) {
      this.alertService.info('Репозитории уже синхронизированы');
      this.loaderService.onNotify(false);
      return;
    }
    const observables = [];
    for (const yandexFile of yandexFilesToSend) {
      observables.push(this.yandexService.downloadFile(yandexFile).pipe(concatMap(yandexBlobFile => {
        return this.googleService.uploadFile(yandexFile.mime_type, yandexBlobFile)
          .pipe(concatMap(googleResponse => {
            const googleCreatedFileId = googleResponse.id;
            return this.googleService.renameFile(googleCreatedFileId, yandexFile.name);
          }));
      })));
    }
    for (const googleFile of googleFilesToSend) {
      observables.push(this.googleService.downloadFile(googleFile).pipe(concatMap(googleBlobFile => {
        return this.yandexService.requestUploadUrl(googleFile.title).pipe(concatMap(uploadUrl => {
          return this.yandexService.uploadFile(uploadUrl.href, googleBlobFile);
        }));
      })));
    }
    forkJoin(observables).subscribe(result => {
      this.update();
      this.alertService.success('Файловые хранилища синхронизированы');
      this.loaderService.onNotify(false);
    });
  }

  uploadGoogleFiles(files: FileList) {
    this.loaderService.onNotify(true);
    const observables = [];
    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);
      if (this.googleFiles.filter(googleFile => googleFile.title === file.name).length > 0) {
        this.alertService.info('Файл с именем ' + file.name + ' уже есть на Google Drive');
        continue;
      }
      observables.push(this.googleService.uploadFile(file.type || 'application/octet-stream', file)
          .pipe(concatMap(googleResponse => {
            console.log('googleUploadResponse', googleResponse);
            const googleCreatedFileId = googleResponse.id;
            return this.googleService.renameFile(googleCreatedFileId, file.name);
          })));
    }
    if (observables.length === 0) {
      this.loaderService.onNotify(false);
      return;
    }
    forkJoin(observables).subscribe(result => {
      this.update();
      this.alertService.success('Файлы успешно загружены на Google Drive');
      this.loaderService.onNotify(false);
    });
  }

  uploadYandexFiles(files: FileList) {
    this.loaderService.onNotify(true);
    const observables = [];
    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);
      if (this.yandexFiles.filter(yandexFile => yandexFile.name === file.name).length > 0) {
        this.alertService.info('Файл с именем ' + file.name + ' уже есть на Яндекс.Диске');
        continue;
      }
      observables.push(this.yandexService.requestUploadUrl(file.name).pipe(concatMap(uploadUrl => {
          return this.yandexService.uploadFile(uploadUrl.href, file);
        })));
    }
    if (observables.length === 0) {
      this.loaderService.onNotify(false);
      return;
    }
    forkJoin(observables).subscribe(result => {
      this.update();
      this.alertService.success('Файлы успешно загружены на Яндекс.Диск');
      this.loaderService.onNotify(false);
    });
  }
}
