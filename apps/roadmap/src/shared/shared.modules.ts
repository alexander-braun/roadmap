import { NgModule } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { EditableDirective } from './directives/editable.directive';
import { ColorPickerModule } from 'ngx-color-picker';
import { ClickOutsideDirective } from './directives/click-outside.directive';

@NgModule({
  declarations: [EditableDirective, ClickOutsideDirective],
  imports: [FontAwesomeModule, ColorPickerModule],
  exports: [FontAwesomeModule, ColorPickerModule, EditableDirective, ClickOutsideDirective],
  providers: [],
})
export class SharedModule {}
