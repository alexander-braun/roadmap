export interface Category {
  categoryName: string;
  categoryIcon: IconChoice;
  categoryBgColor: string;
  categoryIconColor: string;
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
