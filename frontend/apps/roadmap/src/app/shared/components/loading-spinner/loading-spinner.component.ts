import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'rdmp-loading-spinner',
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingSpinnerComponent {
  @Input() height!: number;
}
