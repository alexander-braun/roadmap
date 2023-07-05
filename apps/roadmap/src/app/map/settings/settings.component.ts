import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { SettingsService } from './settings.service';
import { faPencil } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject } from 'rxjs';
import {
  faStar,
  faHeart,
  faBell,
  faCheck,
  faExclamation,
  faXmark,
  faBolt,
  faBook,
  faQuestion,
} from '@fortawesome/free-solid-svg-icons';
import { IconChoice } from './settings.model';
import { Category } from './settings.model';

@Component({
  selector: 'rdmp-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  faPencil = faPencil;
  isEdit = false;
  public icons: IconChoice[] = [
    'faBell',
    'faQuestion',
    'faExclamation',
    'faBolt',
    'faBook',
    'faCheck',
    'faXmark',
    'faHeart',
    'faStar',
  ];
  public iconsMap = {
    faBell,
    faQuestion,
    faExclamation,
    faBolt,
    faBook,
    faCheck,
    faXmark,
    faHeart,
    faStar,
  };
  public settingsForm = this.fb.group({
    categories: this.fb.array<FormGroup>([]),
  });
  public iconChoiceVisible$$ = new BehaviorSubject(-1);
  public bgColors = ['lightgrey', '#eded1c', '#ffc743', '#1fc2bb', '#4abe42', '#2b78e4', '#b614b6', 'red', 'grey'];
  public iconColors = ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white'];
  public showBgColors: string[] = [];
  public showIconColors: string[] = [];

  constructor(private fb: FormBuilder, private settingsService: SettingsService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.patchCategories();
    this.categories.valueChanges.subscribe(() => console.log(this.categories.value));
  }

  public flipEdit() {
    this.isEdit = !this.isEdit;
  }

  public setBackgroundColor(color: string, i: number): void {
    this.categories.controls[i].patchValue({
      categoryBgColor: color,
    });
  }

  public preventInput(e: Event): void {
    if (e instanceof InputEvent) {
      e.preventDefault();
    }
  }

  getName(i: number) {
    return this.categories.controls[i].get('categoryName')?.value;
  }

  public flipShowIcons(categoriesControl: FormGroup): void {
    this.categories.controls.forEach((control, i) => {
      if (
        control.get('categoryName')?.value ===
        this.categories.controls[this.iconChoiceVisible$$.value]?.get('categoryName')?.value
      ) {
        this.iconChoiceVisible$$.next(-1);
      } else if (control.get('categoryName')?.value === categoriesControl.get('categoryName')?.value) {
        this.iconChoiceVisible$$.next(i);
      }
    });
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
        this.showBgColors.push(category.categoryBgColor);
        this.showIconColors.push(category.categoryIconColor);
      });
    });
  }

  track(index: number, item: any) {
    return index;
  }

  public getCategoryInformation(i: number): Category {
    return this.categories.controls[i].value;
  }

  get categories(): FormArray<FormGroup> {
    return this.settingsForm.controls.categories;
  }

  public setIconColor(color: string, i: number): void {
    this.categories.controls[i].patchValue({
      categoryIconColor: color,
    });
  }

  public setIcon(iconNumber: number, i: number): void {
    this.categories.controls[i].patchValue({
      categoryIcon: this.icons[iconNumber],
      categoryBgColor: this.bgColors[iconNumber],
      categoryIconColor: this.iconColors[iconNumber],
    });
    this.showIconColors[i] = this.iconColors[iconNumber];
    this.showBgColors[i] = this.bgColors[iconNumber];
    this.cdr.detectChanges();
  }

  getBackgroundColor(i: number) {
    return this.categories.controls[i].get('categoryBgColor')?.value;
  }
}
