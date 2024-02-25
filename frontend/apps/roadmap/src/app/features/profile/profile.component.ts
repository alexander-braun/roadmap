import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Subject, catchError, of, tap } from 'rxjs';
import { ModalService } from '../../shared/services/modal.service';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'rdmp-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  public readonly faTimes = faTimes;
  public loading$ = new Subject<void>();
  public passwordControl = this.fb.control('', [Validators.required, Validators.minLength(7)]);

  constructor(
    private modalService: ModalService,
    private authService: AuthService,
    private fb: NonNullableFormBuilder
  ) {}

  public close(): void {
    this.modalService.close();
  }

  public deleteMe(): void {
    this.authService.deleteUser();
    this.close();
  }

  public setNewPassword(): void {
    if (this.passwordControl.valid) {
      this.authService
        .setNewPassword(this.passwordControl.value)
        .pipe(
          catchError(() => {
            // TODO: Error message here
            return of(false);
          }),
          tap((res) => {
            if (res) {
              // TODO: Success message here
            }
          })
        )
        .subscribe();
      this.close();
    }
  }
}
