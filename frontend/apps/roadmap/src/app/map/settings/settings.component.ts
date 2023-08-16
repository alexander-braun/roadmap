import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { SettingsService } from './settings.service';
import { faPencil, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject, Observable } from 'rxjs';
import { Categories, Category } from './settings.model';
import { icons, iconsMap } from './icons-preset.data';
import { ResizeObserverService } from '../../../shared/services/resize-observer.service';
import { v4 } from 'uuid';
import { ModalService } from '../../../shared/services/modal.service';

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
    categories: this.fb.array<FormGroup>([]),
  });

  constructor(
    private resizeService: ResizeObserverService,
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private modalService: ModalService
  ) {
    this.innerWidth$ = this.resizeService.innerWidth$;
  }

  public close() {
    this.modalService.close();
  }

  ngOnInit(): void {
    this.handleCategoriesChanges();
  }

  public addCategory(): void {
    this.categories.controls.push(
      this.fb.group({
        categoryName: this.fb.nonNullable.control('New'),
        categoryIcon: this.fb.nonNullable.control('faQuestion'),
        categoryBgColor: this.fb.nonNullable.control('#ff0000'),
        categoryIconColor: this.fb.nonNullable.control('#fff'),
        categoryId: this.fb.nonNullable.control(v4()),
      })
    );
    this.showBgColors.push('#ff0000');
    this.showIconColors.push('#fff');
    this.updateForm();
  }

  private handleCategoriesChanges(): void {
    this.settingsService.categories$.subscribe((categories) => {
      this.patchCategories(categories);
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

  private patchCategories(categories: Categories): void {
    this.categories.controls = [];
    this.showBgColors = [];
    this.showIconColors = [];
    categories.forEach((category) => {
      const { categoryName, categoryIcon, categoryBgColor, categoryIconColor, categoryId } = category;
      this.categories.controls.push(
        this.fb.group({
          categoryName: this.fb.nonNullable.control(categoryName),
          categoryIcon: this.fb.nonNullable.control(categoryIcon),
          categoryBgColor: this.fb.nonNullable.control(categoryBgColor),
          categoryIconColor: this.fb.nonNullable.control(categoryIconColor),
          categoryId: this.fb.nonNullable.control(categoryId),
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
    return this.categories.controls[i].value;
  }

  get categories(): FormArray<FormGroup> {
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
    this.settingsService.cancelCategoriesForm();
    this.flipEdit();
  }

  public saveCategories(): void {
    if (this.checkIfCategoriesAreValid()) {
      this.settingsService.saveCategoriesForm(this.categories.value);
      this.flipEdit();
    }
  }

  private checkIfCategoriesAreValid(): boolean {
    const names: string[] = [];
    let isValid = true;
    this.categories.controls.forEach((control) => {
      const name = control.get('categoryName')?.value;
      if (names.indexOf(name) >= 0) {
        isValid = false;
      } else {
        names.push(control.get('categoryName')?.value);
      }
    });
    return isValid;
  }

  public updateForm(): void {
    this.categories.updateValueAndValidity();
  }
}
