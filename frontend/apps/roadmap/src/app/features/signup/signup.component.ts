import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../shared/services/auth.service';
import { ModalService } from '../../shared/services/modal.service';
import { takeUntil, catchError, EMPTY } from 'rxjs';

@Component({
  selector: 'rdmp-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignupComponent implements OnDestroy {
  public readonly faTimes = faTimes;
  private destroy$ = new Subject<void>();
  public loading$ = new Subject<boolean>();
  public signupForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(7)]],
  });

  constructor(private modalService: ModalService, private fb: FormBuilder, private authService: AuthService) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public close(): void {
    this.modalService.close();
  }

  public goToLogin(): void {
    this.modalService.close();
    this.modalService.open('loginComponent');
  }

  public signup() {
    if (!this.signupForm.valid) {
      this.signupForm.markAllAsTouched();
      return;
    }
    this.loading$.next(true);
    this.authService
      .signup(this.signupForm.controls.email.value, this.signupForm.controls.password.value)
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          this.loading$.next(false);
          return EMPTY;
        })
      )
      .subscribe(() => {
        this.loading$.next(false);
        this.modalService.close();
      });
  }
}
