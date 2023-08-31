import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { ModalService } from '../../shared/services/modal.service';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'rdmp-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent {
  public isAuthorized$: Observable<boolean>;

  constructor(private modalService: ModalService, private authService: AuthService) {
    this.isAuthorized$ = this.authService.isAuthorized$;
  }

  public logout(): void {
    this.authService.logout().subscribe();
  }

  public openSettings(): void {
    this.modalService.open('settingsComponent');
  }

  public openLogin(): void {
    this.modalService.open('loginComponent');
  }

  public singup(): void {
    this.modalService.open('signupComponent');
  }

  public openPresets(): void {
    this.modalService.open('presetsComponent');
  }
}
