import { Status } from '../map.model';

export interface Category {
  categoryName: string;
  categoryIcon: IconChoice;
  categoryBgColor: string;
  categoryIconColor: string;
  categoryId: string;
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
