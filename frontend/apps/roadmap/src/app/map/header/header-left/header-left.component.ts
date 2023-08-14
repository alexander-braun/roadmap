import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'rdmp-header-left',
  templateUrl: './header-left.component.svg',
  styleUrls: ['./header-left.component.scss'],
  host: {
    style: 'display: contents',
  },
})
export class HeaderLeftComponent {}
