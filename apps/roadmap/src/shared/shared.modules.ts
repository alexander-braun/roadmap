import { NgModule } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { EditableDirective } from './directives/editable.directive';
import { ColorPickerModule } from 'ngx-color-picker';

@NgModule({
  declarations: [EditableDirective],
  imports: [FontAwesomeModule, ColorPickerModule],
  exports: [FontAwesomeModule, ColorPickerModule, EditableDirective],
  providers: [],
})
export class SharedModule {}
