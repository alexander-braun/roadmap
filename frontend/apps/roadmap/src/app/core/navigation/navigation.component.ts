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
  public open = false;

  constructor(private modalService: ModalService, private authService: AuthService) {
    this.isAuthorized$ = this.authService.isAuthorized$;
  }

  public logout(): void {
    this.authService.logout().subscribe();
    this.closeMenu();
  }

  public openSettings(): void {
    this.modalService.open('settingsComponent');
    this.closeMenu();
  }

  public openLogin(): void {
    this.modalService.open('loginComponent');
    this.closeMenu();
  }

  public singup(): void {
    this.modalService.open('signupComponent');
    this.closeMenu();
  }

  public openPresets(): void {
    this.modalService.open('presetsComponent');
    this.closeMenu();
  }

  public openProfile(): void {
    this.modalService.open('profileComponent');
    this.closeMenu();
  }

  public switchMenu(): void {
    this.open = !this.open;
  }

  public clickOutsideSidenav(): void {
    if (this.open) {
      this.closeMenu();
    }
  }

  public closeMenu(): void {
    this.open = false;
  }
}
