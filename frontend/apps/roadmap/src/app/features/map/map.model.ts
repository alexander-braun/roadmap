import { NodeId } from 'apps/roadmap/src/assets/data';

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

export type Status = 'pending' | 'in-progress' | 'done';

export interface CardData {
  title?: string;
  date?: string;
  notes?: string[];
  categoryId?: string;
  status?: Status;
}

export type PaathCoordinateCollection = PaathProperty[];
export type CardPropertyCollection = CardProperty[];
export type Direction = 'left' | 'right';
export interface CardDataTree {
  [key: NodeId]: CardData;
}

export interface Roadmap {
  _id: string;
  date: string;
  updatedAt: string;
  createdAt: string;
  title: string;
  subtitle: string;
  owner: string;
  map: {
    mainKnot: boolean;
    children: string[];
    id: string;
    title: string;
    notes: string[];
    categoryId: string;
    status: Status;
    date: string;
  }[];
}

export interface PresetInfo {
  title: string;
  subtitle: string;
  updatedAt: string;
  date: string;
  id: string;
  createdAt: string;
}

export type RoadmapPatchResponse = Omit<PresetInfo & { __v: number; map: Node[]; _id: string }, 'id'>;
