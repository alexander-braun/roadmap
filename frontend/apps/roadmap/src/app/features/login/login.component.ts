import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FormBuilder, Validators } from '@angular/forms';
import { EMPTY, Subject, catchError, takeUntil } from 'rxjs';
import { ModalService } from '../../shared/services/modal.service';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'rdmp-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnDestroy {
  public readonly faTimes = faTimes;
  private destroy$ = new Subject<void>();
  public loading$ = new Subject<boolean>();
  public loginForm = this.fb.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
  });

  constructor(private modalService: ModalService, private fb: FormBuilder, private authService: AuthService) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public close(): void {
    this.modalService.close();
  }

  public login(): void {
    if (!this.loginForm.valid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading$.next(true);
    this.authService
      .login(this.loginForm.controls.email.value, this.loginForm.controls.password.value)
      .pipe(
        takeUntil(this.destroy$),
        catchError((e) => {
          if (e.error === 'Email not found') {
            this.loginForm.controls.email.setErrors({ email: true });
          } else if (e.error === 'Wrong password') {
            this.loginForm.controls.password.setErrors({ password: true });
          }
          this.loading$.next(false);
          return EMPTY;
        })
      )
      .subscribe(() => {
        this.loading$.next(false);
        this.modalService.close();
      });
  }

  public goToSignUp(): void {
    this.modalService.close();
    this.modalService.open('signupComponent');
  }

  public handleForgotPassword() {}
}
