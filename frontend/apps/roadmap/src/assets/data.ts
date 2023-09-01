import { CardDataTree } from '../app/features/map/map.model';
import { Categories, StatusChoices } from '../app/features/map/settings/settings.model';

export type Node = {
  children: string[];
  mainKnot?: boolean;
};

export interface Nodes {
  [key: string]: Node;
}

export type NodeId = string;

export const statusChoices: StatusChoices = [
  {
    statusColor: '#f80502',
    statusName: 'pending',
  },
  {
    statusColor: '#fea503',
    statusName: 'in-progress',
  },
  {
    statusColor: '#0dee89',
    statusName: 'done',
  },
];

export const categories: Categories = [
  {
    categoryIcon: 'faExclamation',
    categoryName: 'Recommended Option',
    categoryBgColor: '#ffc743',
    categoryIconColor: '#fff',
    categoryId: '1',
  },
  {
    categoryIcon: 'faCheck',
    categoryName: 'Good Alternative',
    categoryBgColor: '#2b78e4',
    categoryIconColor: '#fff',
    categoryId: '2',
  },
  {
    categoryIcon: 'faXmark',
    categoryName: 'Not recommended',
    categoryBgColor: '#b614b6',
    categoryIconColor: '#fff',
    categoryId: '3',
  },
  {
    categoryIcon: 'faQuestion',
    categoryName: 'Optional',
    categoryBgColor: '#cecece',
    categoryIconColor: '#fff',
    categoryId: '4',
  },
];
