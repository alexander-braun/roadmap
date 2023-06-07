export interface CardProperty {
  parentRect: DOMRect;
  childRect: DOMRect;
  center: boolean;
  scrollHeight: number;
}

export interface PaathCoordinate {
  startPointX: number;
  startPointY: number;
  endPointX: number;
  curveX1: number;
  curveX2: number;
  endPointY: number;
  curveY1: number;
  curveY2: number;
  center: boolean;
}

export type PaathCoordinateCollection = PaathCoordinate[];
export type CardPropertyCollection = CardProperty[];
export type Direction = 'left' | 'right';
