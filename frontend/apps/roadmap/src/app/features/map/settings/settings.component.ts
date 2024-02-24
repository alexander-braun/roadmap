import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormArray, FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { faPencil, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject, Observable } from 'rxjs';
import { Categories, Category, CategoryFormGroup, IconChoice } from './settings.model';
import { icons, iconsMap } from './icons-preset.data';
import { v4 } from 'uuid';
import { ModalService } from '../../../shared/services/modal.service';
import { ResizeObserverService } from '../../../shared/services/resize-observer.service';
import { MapService } from '../map.service';

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
  public readonly faPlus = faPlus;
  public isEdit = false;
  public iconToEditPick$$ = new BehaviorSubject(-1);
  public iconToEditPick$ = this.iconToEditPick$$.asObservable();
  public showBgColors: string[] = [];
  public showIconColors: string[] = [];
  public innerWidth$: Observable<number>;
  public modal: ModalService | null = null;
  public settingsForm = this.fb.group({
    categories: this.fb.array<FormGroup<CategoryFormGroup>>([]),
  });

  constructor(
    private resizeService: ResizeObserverService,
    private fb: NonNullableFormBuilder,
    private modalService: ModalService,
    private mapService: MapService
  ) {
    this.innerWidth$ = this.resizeService.innerWidth$;
  }

  public close() {
    this.modalService.close();
  }

  ngOnInit(): void {
    this.handleCategoriesChanges();
    this.settingsForm.valueChanges.subscribe(() => this.checkIfCategoriesAreValid());
  }

  public addCategory(): void {
    this.categories.controls.push(
      this.fb.group({
        categoryName: this.fb.control('New'),
        categoryIcon: this.fb.control<IconChoice>('faQuestion'),
        categoryBgColor: this.fb.control('#ff0000'),
        categoryIconColor: this.fb.control('#fff'),
        categoryId: this.fb.control(v4()),
      } as CategoryFormGroup)
    );
    this.showBgColors.push('#ff0000');
    this.showIconColors.push('#fff');
    this.updateForm();
  }

  private handleCategoriesChanges(): void {
    this.mapService.categories$.subscribe((categories) => {
      this.patchCategories(categories);
      this.mapService.patchCardDataOnCategoriesChange(categories);
    });
  }

  public flipEdit(): void {
    this.isEdit = !this.isEdit;
    this.iconToEditPick$$.next(-1);
    this.resizeService.setResizeNext();
  }

  public preventInput(e: Event): void {
    if (e instanceof InputEvent) {
      e.preventDefault();
    }
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

  private patchCategories(categories: Categories): void {
    this.categories.controls = [];
    this.showBgColors = [];
    this.showIconColors = [];
    categories.forEach((category) => {
      const { categoryName, categoryIcon, categoryBgColor, categoryIconColor, categoryId } = category;
      this.categories.controls.push(
        this.fb.group({
          categoryName: this.fb.control(categoryName),
          categoryIcon: this.fb.control(categoryIcon),
          categoryBgColor: this.fb.control(categoryBgColor),
          categoryIconColor: this.fb.control(categoryIconColor),
          categoryId: this.fb.control(categoryId),
        })
      );
      this.showBgColors.push(categoryBgColor);
      this.showIconColors.push(categoryIconColor);
    });
  }

  public track(index: number, _: FormGroup): number {
    return index;
  }

  public getCategoryInformation(i: number): Category {
    return (this.settingsForm.controls.categories.controls[i] as FormGroup<CategoryFormGroup>).getRawValue();
  }

  get categories(): FormArray<FormGroup<CategoryFormGroup>> {
    return this.settingsForm.controls.categories;
  }

  public setIconColor(color: string, i: number): void {
    this.categories.controls[i].patchValue({
      categoryIconColor: color,
    });
    this.updateForm();
  }

  public setBackgroundColor(color: string, i: number): void {
    this.categories.controls[i].patchValue({
      categoryBgColor: color,
    });
    this.updateForm();
  }

  public setIcon(iconNumber: number, i: number): void {
    this.categories.controls[i].patchValue({
      categoryIcon: this.icons[iconNumber],
    });
    this.iconToEditPick$$.next(-1);
    this.updateForm();
  }

  public delete(i: number): void {
    this.categories.controls.splice(i, 1);
    this.showBgColors.splice(i, 1);
    this.showIconColors.splice(i, 1);
    this.updateForm();
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

  public cancelCategoriesForm(): void {
    this.mapService.cancelCategories();
    this.flipEdit();
  }

  public saveCategories(): void {
    this.settingsForm.controls.categories.updateValueAndValidity();
    if (this.settingsForm.controls.categories.valid) {
      this.mapService.patchSettings(this.categories.getRawValue());
      this.flipEdit();
    }
  }

  private checkIfCategoriesAreValid() {
    const names: string[] = [];
    this.settingsForm.controls.categories.controls.forEach((control, i) => {
      const name = control.controls['categoryName'].value;
      if (names.indexOf(name) >= 0) {
        this.settingsForm.controls.categories.controls[i].setErrors({ nonUniqueName: true });
      } else {
        names.push(control.controls['categoryName'].value);
      }
    });
  }

  public updateForm(): void {
    this.categories.updateValueAndValidity();
  }
}
