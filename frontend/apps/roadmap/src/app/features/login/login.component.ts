import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { ModalService } from '../../shared/services/modal.service';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'rdmp-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnDestroy, OnInit {
  public readonly faTimes = faTimes;
  private destroy$ = new Subject<void>();
  public loginForm = this.fb.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
  });

  constructor(
    private modalService: ModalService,
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    console.log('init');
  }

  public close(): void {
    this.modalService.close();
  }

  public login(): void {
    if (!this.loginForm.valid) {
      return;
    }

    this.authService
      .login(this.loginForm.controls.email.value, this.loginForm.controls.password.value, this.destroy$)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.http.get('/api/users/me').subscribe((v) => {
          this.modalService.close();
        });
      });
  }

  public goToSignUp(): void {
    this.modalService.close();
    this.modalService.open('signupComponent');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public handleForgotPassword() {}
}
