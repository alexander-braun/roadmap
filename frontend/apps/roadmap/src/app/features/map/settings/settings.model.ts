import { FormControl } from '@angular/forms';
import { Status } from '../map.model';

export interface Category {
  categoryName: string;
  categoryIcon: IconChoice;
  categoryBgColor: string;
  categoryIconColor: string;
  categoryId: string;
}

export interface CategoryFormGroup {
  categoryName: FormControl<string>;
  categoryIcon: FormControl<IconChoice>;
  categoryBgColor: FormControl<string>;
  categoryIconColor: FormControl<string>;
  categoryId: FormControl<string>;
}

export type Categories = Category[];

export type IconChoice =
  | 'faBell'
  | 'faQuestion'
  | 'faExclamation'
  | 'faBolt'
  | 'faBook'
  | 'faCheck'
  | 'faXmark'
  | 'faHeart'
  | 'faStar';

export interface StatusChoice {
  statusName: Status;
  statusColor: string;
}

export type StatusChoices = StatusChoice[];
