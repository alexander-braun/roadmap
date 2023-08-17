import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { EditableDirective } from './directives/editable.directive';
import { ColorPickerModule } from 'ngx-color-picker';
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { ReactiveFormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';

@NgModule({
  declarations: [EditableDirective, ClickOutsideDirective, LoadingSpinnerComponent],
  imports: [CommonModule],
  exports: [
    FontAwesomeModule,
    ColorPickerModule,
    EditableDirective,
    ReactiveFormsModule,
    CommonModule,
    LoadingSpinnerComponent,
  ],
  providers: [],
})
export class SharedModule {}
