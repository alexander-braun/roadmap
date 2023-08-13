import { Component } from '@angular/core';
import { ModalService } from '../../shared/services/modal.service';

@Component({
  selector: 'rdmp-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent {
  constructor(private modalService: ModalService) {}
  public openSettings() {
    this.modalService.open('settingsComponent');
  }
}
