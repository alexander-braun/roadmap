import { CardDataTree } from '../app/map/map.model';
import { Categories, StatusChoices } from '../app/map/settings/settings.model';

export type Node = {
  children: string[];
  mainKnot?: boolean;
};

export interface Nodes {
  [key: string]: Node;
}

export type NodeId = string;

export const cardDataTree: CardDataTree = {
  p1: {
    title: 'First element',
    status: 'pending',
  },
  c1: {
    title: 'My Title',
    notes: ['note 1', 'note 2', 'note 3'],
    categoryId: '1',
    status: 'done',
  },
  c5: {
    title: 'I am c5',
    notes: ['my c5 note', 'and another one'],
    status: 'in-progress',
    categoryId: '3',
    date: '22.01.1988',
  },
};

export const nodes: Nodes = {
  p1: {
    mainKnot: true,
    children: ['c1', 'c2', 'c3'],
  },
  c1: {
    mainKnot: false,
    children: ['s1', 's2', 's3'],
  },
  c2: {
    mainKnot: false,
    children: ['s4', 's5', 's6'],
  },
  c3: {
    mainKnot: false,
    children: ['s7'],
  },
  s1: {
    mainKnot: false,
    children: [],
  },
  s2: {
    mainKnot: false,
    children: [],
  },
  s3: {
    mainKnot: false,
    children: [],
  },
  s4: {
    mainKnot: false,
    children: [],
  },
  s5: {
    mainKnot: false,
    children: [],
  },
  s6: {
    mainKnot: false,
    children: [],
  },
  s7: {
    mainKnot: false,
    children: [],
  },
  p2: {
    mainKnot: true,
    children: ['c4', 'c5'],
  },
  c4: {
    mainKnot: false,
    children: ['s8'],
  },
  s8: {
    mainKnot: false,
    children: [],
  },
  c5: {
    mainKnot: false,
    children: [],
  },
};

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
