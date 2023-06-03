import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { BehaviorSubject, Subject, tap } from 'rxjs';
import { CardPropertyCollection } from '../map.model';

export type Direction = 'left' | 'right';

@Component({
  selector: '[rdmp-svg-path]',
  templateUrl: './svg-path.component.html',
  styleUrls: ['./svg-path.component.scss'],
})
export class SvgPathComponent implements OnInit {
  @Input() cardPropertycollection!: CardPropertyCollection;
  public pathCoords$ = new BehaviorSubject<string[]>([]);

  constructor() {}

  ngOnInit(): void {
    /*
        const e = this.coordPairs?.map(pair => {
            return `M ${pair.moveToX} ${pair.moveToY} C 700.4375 2332.359375, 670.4375 2332.359375, 621.84375 2220.0703125`
        }) || [];
        this.pathCoords$.next(e)
        */
    const finalCoords: {
      moveToX: number;
      moveToY: number;
      curveX: number;
      curveX1: number;
      curveX2: number;
      curveY: number;
      curveY1: number;
      curveY2: number;
    }[] = [];
    this.cardPropertycollection?.forEach((pair) => {
      finalCoords.push(this.calculateFinalCoords(pair));
    });
    this.pathCoords$.next(
      finalCoords.map((coord) => {
        return `M ${coord.moveToX} ${coord.moveToY} C ${coord.curveX1} ${coord.curveY1}, ${coord.curveX2} ${coord.curveY2}, ${coord.curveX} ${coord.curveY}`;
      })
    );
    console.log('HERE: ', finalCoords);
  }

  calculateFinalCoords(props: {
    parentRect: DOMRect;
    childRect: DOMRect;
    center: boolean;
    scrollHeight: number;
  }) {
    const insetSvgBy = 5;

    const moveToX =
      props.childRect.x > props.parentRect.x && !props.center
        ? props.parentRect.x + props.parentRect.width - insetSvgBy - 20
        : props.center
        ? props.parentRect.x + props.parentRect.width / 2
        : props.parentRect.x + insetSvgBy + 20;

    const moveToY = props.center
      ? props.parentRect.y + props.parentRect.height + props.scrollHeight
      : props.parentRect.y + props.parentRect.height / 2 + props.scrollHeight;

    const curveX =
      props.childRect.x < props.parentRect.x && !props.center
        ? props.childRect.x + props.childRect.width
        : props.center
        ? props.childRect.x + props.childRect.width / 2
        : props.childRect.x;

    const curveY = props.center
      ? props.childRect.y + props.scrollHeight
      : props.childRect.y + props.childRect.height / 2 + props.scrollHeight;

    const curveX1 =
      props.childRect.x > props.parentRect.x && !props.center
        ? moveToX + 20
        : props.center
        ? moveToX
        : moveToX - 20;

    const curveX2 =
      props.childRect.x > props.parentRect.x && !props.center
        ? moveToX + 50
        : props.center
        ? moveToX
        : moveToX - 50;

    const curveY1 = moveToY;
    const curveY2 = moveToY;
    return {
      moveToX,
      moveToY,
      curveX,
      curveX1,
      curveX2,
      curveY,
      curveY1,
      curveY2,
    };
  }
}
