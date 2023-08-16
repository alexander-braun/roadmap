import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'rdmp-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignupComponent {}
