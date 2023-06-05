import { ChangeDetectionStrategy, Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { CardProperty, CardPropertyCollection, PaathCoordinate, PaathCoordinateCollection } from '../map/map.model';
import { ResizeObserverService } from 'apps/roadmap/src/shared/services/resize-observer.service';

@Component({
  selector: '[rdmp-svg-path]',
  templateUrl: './svg-path.component.html',
  styleUrls: ['./svg-path.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SvgPathComponent implements OnInit, OnChanges {
  @Input() cardPropertyCollection: CardPropertyCollection = [];
  private pathCoords$$ = new BehaviorSubject<(string | boolean | boolean)[][]>([]);
  public pathCoords$ = this.pathCoords$$.asObservable();

  constructor(private resizeObserver: ResizeObserverService) {}

  ngOnInit(): void {
    this.handleResize();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['cardPropertyCollection']) {
      this.calculateNewCoordinates();
    }
  }

  private handleResize(): void {
    this.resizeObserver.resize$.asObservable().subscribe(() => this.calculateNewCoordinates());
  }

  private calculateNewCoordinates(): void {
    const pathDAttributeMapping = this.cardPropertyCollection
      .map((pair) => this.calculatePaathCoordinate(pair))
      .map((coord) => [
        `M ${coord.moveToX} ${coord.moveToY} C ${coord.curveX1} ${coord.curveY1}, ${coord.curveX2} ${coord.curveY2}, ${coord.curveX} ${coord.curveY}`,
        coord.center,
      ]);

    this.pathCoords$$.next(pathDAttributeMapping);
  }

  private calculatePaathCoordinate({ parentRect, childRect, center, scrollHeight }: CardProperty): PaathCoordinate {
    const insetSvgBy = 5;
    const pathStartDistanceFromCardBorder = 20;
    const curvingAmount = 50;

    const moveToX =
      childRect.x > parentRect.x && !center
        ? parentRect.x + parentRect.width - insetSvgBy - pathStartDistanceFromCardBorder
        : center
        ? parentRect.x + parentRect.width / 2
        : parentRect.x + insetSvgBy + pathStartDistanceFromCardBorder;

    // 22 is height of center element make var of it
    const moveToY = center
      ? parentRect.y + parentRect.height + scrollHeight
      : parentRect.y + parentRect.height / 2 + scrollHeight;

    const curveX =
      childRect.x < parentRect.x && !center
        ? childRect.x + childRect.width
        : center
        ? childRect.x + childRect.width / 2
        : childRect.x;

    // 16 is height of 1 child element -> make var of it
    const curveY = center ? childRect.y + scrollHeight : childRect.y + childRect.height / 2 + scrollHeight;

    const curveX1 =
      childRect.x > parentRect.x && !center
        ? moveToX + pathStartDistanceFromCardBorder
        : center
        ? moveToX
        : moveToX - pathStartDistanceFromCardBorder;

    const curveX2 =
      childRect.x > parentRect.x && !center ? moveToX + curvingAmount : center ? moveToX : moveToX - curvingAmount;

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
      center,
    };
  }
}
