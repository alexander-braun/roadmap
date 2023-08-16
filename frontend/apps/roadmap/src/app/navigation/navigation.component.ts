import { Component } from '@angular/core';
import { ModalService } from '../../shared/services/modal.service';
import { AuthService } from '../../shared/services/auth.service';
import { Observable } from 'rxjs';

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

  public openSettings() {
    this.modalService.open('settingsComponent');
  }

  public openLogin() {
    this.modalService.open('loginComponent');
  }

  public logout() {
    this.authService.logout().subscribe();
  }

  public singup() {}
}
