import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {LoaderService} from '../../services/loader/loader.service';
import {AuthService} from '../../services/auth/auth.service';
import {AlertService} from '../../services/alert/alert.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  tabs = [{name: 'login', displayName: 'Вход'}, {name: 'sign_up', displayName: 'Регистрация'}];
  selectedTab = this.tabs[0];
  loginForm: FormGroup;
  signUpForm: FormGroup;
  loginFormSubmitted = false;
  signUpFormSubmitted = false;

  constructor(private http: HttpClient,
              private router: Router,
              private formBuilder: FormBuilder,
              private loaderService: LoaderService,
              private authService: AuthService,
              private alertService: AlertService) {
    if (this.authService.isSignedIn()) {
      this.router.navigateByUrl('/home');
    }
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
    this.signUpForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
  }

  get login() {
    return this.loginForm.controls;
  }

  get signUp() {
    return this.signUpForm.controls;
  }

  selectTab(tab) {
    this.selectedTab = tab;
    this.signUpFormSubmitted = false;
    this.loginFormSubmitted = false;
    this.signUpForm.reset();
    this.loginForm.reset();
  }

  submitSignUp() {
    this.signUpFormSubmitted = true;
    if (this.signUpForm.invalid) {
      return;
    }
  }

  submitLogin() {
    this.loginFormSubmitted = true;
    if (this.loginForm.invalid) {
      return;
    }
    this.loaderService.onNotify(true);
    this.authService.login(this.login.email.value, this.login.password.value)
      .subscribe(
        data => {
          this.loaderService.onNotify(false);
          this.router.navigateByUrl('/home');
        },
        error => {
          this.alertService.error('Неверный логин/пароль');
          this.loaderService.onNotify(false);
        });
  }
}
