import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { SettingsService } from './settings.service';

@Component({
  selector: 'rdmp-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent implements OnInit {
  public settingsForm = this.fb.group({
    categories: this.fb.array<FormGroup>([]),
  });

  constructor(private fb: FormBuilder, private settingsService: SettingsService) {}

  ngOnInit(): void {
    this.patchCategories();
  }

  private patchCategories(): void {
    this.settingsService.categories$.subscribe((categories) => {
      categories.forEach((category, i) => {
        this.categories.controls.push(
          this.fb.group({
            categoryName: this.fb.nonNullable.control(category.categoryName),
            categoryIcon: this.fb.nonNullable.control(category.categoryIcon),
            categoryBgColor: this.fb.nonNullable.control(category.categoryBgColor),
            categoryIconColor: this.fb.nonNullable.control(category.categoryIconColor),
          })
        );
      });
    });
  }

  get categories(): FormArray<FormGroup> {
    return this.settingsForm.controls.categories;
  }
}
