import { NgModule } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { EditableDirective } from './directives/editable.directive';
import { ColorPickerModule } from 'ngx-color-picker';
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { HoverClassDirective } from './directives/hover-class.directive';

@NgModule({
  declarations: [EditableDirective, ClickOutsideDirective, HoverClassDirective],
  imports: [FontAwesomeModule, ColorPickerModule],
  exports: [FontAwesomeModule, ColorPickerModule, EditableDirective, ClickOutsideDirective, HoverClassDirective],
  providers: [],
})
export class SharedModule {}
