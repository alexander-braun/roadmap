import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'rdmp-header-right',
  templateUrl: './header-right.component.svg',
  styleUrls: ['./header-right.component.scss'],
  host: {
    style: 'display: contents',
  },
})
export class HeaderRightComponent {}
