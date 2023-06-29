import { NgModule } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { EditableDirective } from './directives/editable.directive';

@NgModule({
  declarations: [EditableDirective],
  imports: [FontAwesomeModule],
  exports: [FontAwesomeModule, EditableDirective],
  providers: [],
})
export class SharedModule {}
