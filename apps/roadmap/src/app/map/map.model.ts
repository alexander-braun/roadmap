import { NodeId } from '../../assets/data';

export interface CardProperty {
  parentRect: DOMRect;
  childRect: DOMRect;
  center: boolean;
  scrollHeight: number;
}

export interface PaathProperty {
  startPointX: number;
  startPointY: number;
  endPointX: number;
  endPointY: number;
  curveX1: number;
  curveY1: number;
  curveX2: number;
  curveY2: number;
  center: boolean;
}

export interface CardData {
  title: string;
  date?: string;
  notes?: string[];
  categoryId?: string;
  status?: 'pending' | 'in-progress' | 'done' | 'ignore';
}

export type PaathCoordinateCollection = PaathProperty[];
export type CardPropertyCollection = CardProperty[];
export type Direction = 'left' | 'right';
export interface CardDataTree {
  [key: NodeId]: CardData;
}
