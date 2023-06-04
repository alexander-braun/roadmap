import { ChangeDetectionStrategy, Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { BehaviorSubject, Subject, delay, tap } from 'rxjs';
import { CardPropertyCollection, PaathCoordinateCollection } from '../map/map.model';
import { ResizeObserverService } from 'apps/roadmap/src/shared/services/resize-observer.service';

export type Direction = 'left' | 'right';

@Component({
  selector: '[rdmp-svg-path]',
  templateUrl: './svg-path.component.html',
  styleUrls: ['./svg-path.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SvgPathComponent implements OnInit, OnChanges {
  @Input() cardPropertyCollection!: CardPropertyCollection;
  public pathCoords$ = new BehaviorSubject<string[]>([]);

  constructor(private resizeObserver: ResizeObserverService) {}

  ngOnInit(): void {
    this.resizeObserver.resize$
      .asObservable()
      .pipe(tap(() => this.assignCoordinates()))
      .subscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['cardPropertyCollection']) {
      this.assignCoordinates();
    }
  }

  assignCoordinates() {
    const finalCoords: PaathCoordinateCollection = [];
    this.cardPropertyCollection?.forEach((pair) => {
      finalCoords.push(this.calculateFinalCoords(pair));
    });
    const newCoordinates = finalCoords.map((coord) => {
      return `M ${coord.moveToX} ${coord.moveToY} C ${coord.curveX1} ${coord.curveY1}, ${coord.curveX2} ${coord.curveY2}, ${coord.curveX} ${coord.curveY}`;
    });
    this.pathCoords$.next(newCoordinates);
  }

  calculateFinalCoords(props: { parentRect: DOMRect; childRect: DOMRect; center: boolean; scrollHeight: number }) {
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
      props.childRect.x > props.parentRect.x && !props.center ? moveToX + 20 : props.center ? moveToX : moveToX - 20;

    const curveX2 =
      props.childRect.x > props.parentRect.x && !props.center ? moveToX + 50 : props.center ? moveToX : moveToX - 50;

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
