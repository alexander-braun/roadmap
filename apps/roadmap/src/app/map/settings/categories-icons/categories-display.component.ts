import { ChangeDetectionStrategy, Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
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
import { BehaviorSubject, Subject, takeUntil, timer } from 'rxjs';
import { IconChoice } from '../settings.model';

@Component({
  selector: 'rdmp-categories-display',
  templateUrl: './categories-display.component.html',
  styleUrls: ['./categories-display.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesDisplayComponent implements OnInit, OnDestroy {
  @Input() formGroup!: FormGroup;
  public iconColor = 'white';
  public bgColor = 'grey';
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
  public bgColors = ['lightgrey', '#eded1c', '#ffc743', '#1fc2bb', '#4abe42', '#2b78e4', '#b614b6', 'red', 'grey'];
  public iconColors = ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white'];
  public hover$$ = new BehaviorSubject(false);
  public selected = 0;
  private destroy$ = new Subject<void>();
  constructor() {}

  ngOnInit(): void {
    this.selected = this.icons.indexOf(this.formGroup.get('categoryIcon')?.value);
    this.iconColor = this.formGroup.get('categoryIconColor')?.value;
    this.bgColor = this.formGroup.get('categoryBgColor')?.value;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setHover(hover: boolean): void {
    this.hover$$.next(hover);
  }

  public addHoverClass(): void {
    this.setHover(true);
  }

  public removeHoverClass(): void {
    timer(500)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.setHover(false);
      });
  }

  public setIcon(i: number): void {
    this.selected = i;
    this.bgColor = this.bgColors[i];
    this.iconColor = this.iconColors[i];
  }

  public preventInput(e: Event): void {
    if (e instanceof InputEvent) {
      e.preventDefault();
    }
  }

  public setBackgroundColor(color: string): void {
    this.formGroup.patchValue({
      categoryBgColor: color,
    });
    this.bgColor = color;
  }

  public setIconColor(color: string): void {
    this.formGroup.patchValue({
      categoryIconColor: color,
    });
    this.iconColor = color;
  }
}
