import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { EditableDirective } from './directives/editable.directive';
import { ColorPickerModule } from 'ngx-color-picker';
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [EditableDirective, ClickOutsideDirective],
  imports: [FontAwesomeModule, ColorPickerModule, ReactiveFormsModule, CommonModule],
  exports: [FontAwesomeModule, ColorPickerModule, EditableDirective, ReactiveFormsModule, CommonModule],
  providers: [],
})
export class SharedModule {}
