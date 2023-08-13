import { HostListener, Directive, OnInit, Input } from '@angular/core';

import { ModalService } from '../services/modal.service';
import { ModalTypes } from '../models/modal.types';

@Directive({
  selector: '[openModal]',
})
export class ModalDirective {
  @Input() identifier?: ModalTypes;

  constructor(private modalService: ModalService) {}

  @HostListener('click', ['$event'])
  clickEvent(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.identifier) {
      this.modalService.open(this.identifier);
    }
  }
}
