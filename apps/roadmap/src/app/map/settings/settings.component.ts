import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { SettingsService } from './settings.service';
import { faPencil } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject } from 'rxjs';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { Category } from './settings.model';
import { icons, iconsMap } from './icons-preset.data';

@Component({
  selector: 'rdmp-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent implements OnInit {
  public readonly faPencil = faPencil;
  public readonly faTrash = faTrash;
  public readonly icons = icons;
  public readonly iconsMap = iconsMap;
  public isEdit = false;
  public settingsForm = this.fb.group({
    categories: this.fb.array<FormGroup>([]),
  });
  public iconToEditPick$$ = new BehaviorSubject(-1);
  public showBgColors: string[] = [];
  public showIconColors: string[] = [];

  constructor(private fb: FormBuilder, private settingsService: SettingsService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.patchCategories();
  }

  public flipEdit(): void {
    this.isEdit = !this.isEdit;
    this.iconToEditPick$$.next(-1);
  }

  public preventInput(e: Event): void {
    if (e instanceof InputEvent) {
      e.preventDefault();
    }
  }

  public getName(i: number): string {
    return this.categories.controls[i].get('categoryName')?.value;
  }

  public flipShowIcons(index: number): void {
    if (!this.isEdit) {
      return;
    }

    this.categories.controls.forEach((control, i) => {
      // if the control was clicked, than
      // the control is currently open and
      // needs to be closed.
      if (i === this.iconToEditPick$$.value) {
        this.iconToEditPick$$.next(-1);
        // otherwise if the control is the same
        // as the newly clicked control it has
        // to be set as the next pick
      } else if (i === index) {
        this.iconToEditPick$$.next(i);
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

  public track(index: number, _: FormGroup): number {
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

  public setBackgroundColor(color: string, i: number): void {
    this.categories.controls[i].patchValue({
      categoryBgColor: color,
    });
  }

  public setIcon(iconNumber: number, i: number): void {
    this.categories.controls[i].patchValue({
      categoryIcon: this.icons[iconNumber],
    });
    this.iconToEditPick$$.next(-1);
  }

  public delete(i: number): void {
    this.categories.controls.splice(i, 1);
  }

  public handleClickOutside(controlIndex: number): void {
    // The control that doesn't fire the click outside is the one
    // that is clicked - if the control itself is clicked it
    // gets already closed by setIcon() or flipShowIcons()
    if (controlIndex !== this.iconToEditPick$$.value) {
      return;
    }
    // There really was a click outside
    this.iconToEditPick$$.next(-1);
  }
}
