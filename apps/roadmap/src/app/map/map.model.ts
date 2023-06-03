export interface CardProperty {
    parentRect: DOMRect;
    childRect: DOMRect;
    center: boolean;
    scrollHeight: number;
}

export interface PaathCoordinate {
    moveToX: number;
    moveToY: number;
    curveX: number;
    curveX1: number;
    curveX2: number;
    curveY: number;
    curveY1: number;
    curveY2: number;
}

export type PaathCoordinateCollection = PaathCoordinate[];
export type CardPropertyCollection = CardProperty[];