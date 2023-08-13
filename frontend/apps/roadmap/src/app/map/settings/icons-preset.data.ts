import { IconChoice } from './settings.model';
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

export const icons: IconChoice[] = [
  'faBell',
  'faQuestion',
  'faExclamation',
  'faCheck',
  'faBook',
  'faHeart',
  'faBolt',
  'faXmark',
  'faStar',
];
export const iconsMap = {
  faBell,
  faQuestion,
  faExclamation,
  faCheck,
  faBook,
  faBolt,
  faXmark,
  faHeart,
  faStar,
} as const;
