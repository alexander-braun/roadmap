import { ChangeDetectionStrategy, Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CardProperty, CardPropertyCollection, PaathCoordinateCollection, PaathProperty } from '../map/map.model';
import { ResizeObserverService } from 'apps/roadmap/src/shared/services/resize-observer.service';

@Component({
  selector: '[rdmp-svg-path]',
  templateUrl: './svg-path.component.html',
  styleUrls: ['./svg-path.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SvgPathComponent implements OnInit, OnChanges {
  private readonly insetSvg = 25;
  @Input() cardPropertyCollection: CardPropertyCollection = [];
  private pathCoords$$ = new BehaviorSubject<PaathCoordinateCollection>([]);
  public pathCoords$ = this.pathCoords$$.asObservable();

  constructor(private resizeObserver: ResizeObserverService) {}

  ngOnInit(): void {
    this.handleResize();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cardPropertyCollection']) {
      this.calculateNewCoordinates();
    }
  }

  private handleResize(): void {
    this.resizeObserver.resize$.subscribe(() => this.calculateNewCoordinates());
  }

  private calculateNewCoordinates(): void {
    const newPathCoordinates = this.cardPropertyCollection.map((pair) => this.calculatePaathCoordinate(pair));
    this.pathCoords$$.next(newPathCoordinates);
  }

  private calculatePaathCoordinate({ parentRect, childRect, center, scrollHeight }: CardProperty): PaathProperty {
    const childIsRightOfParent = childRect.x > parentRect.x;
    const startPointX = this.calculateMoveToX(parentRect, center, childIsRightOfParent);
    const startPointY = this.calculateMoveToY(scrollHeight, parentRect, center);
    const endPointX = this.calculateCurveX(childRect, center, childIsRightOfParent);
    const endPointY = this.calculateCurveY(childRect, center, scrollHeight);
    const curveX1 = this.calculateXCurvature(center, startPointX, childIsRightOfParent, endPointX, true);
    const curveX2 = this.calculateXCurvature(center, startPointX, childIsRightOfParent, endPointX, false);
    const curveY1 = startPointY;
    const curveY2 = startPointY;

    // makeup better names (look at order in wich these occur in d path)
    return {
      startPointX,
      startPointY,
      endPointX,
      endPointY,
      curveX1,
      curveY1,
      curveX2,
      curveY2,
      center,
    };
  }

  // Calculates the first x point of the svg
  private calculateMoveToX(parentRect: DOMRect, center: boolean, childIsRightOfParent: boolean): number {
    // If the child is on the right of the parent:
    // Get ending point of svg and subtract an inset so it doesn't start on edge
    if (childIsRightOfParent && !center) {
      return parentRect.x + parentRect.width - this.insetSvg;
      // If line just goes down because it's in the center
      // Just get the div starting point and cut it in half to get the x middle of the div
    } else if (center) {
      return parentRect.x + parentRect.width / 2;
      // Else the div child is on the left of the parent:
      // Just use the starting point of the div and add the inset so it doesn't start on edge
    } else {
      return parentRect.x + this.insetSvg;
    }
  }

  // Calculates the second x point of the svg
  private calculateCurveX(childRect: DOMRect, center: boolean, childIsRightOfParent: boolean): number {
    // If the child is on the right of the parent:
    // The ending x point is just the starting point of the child
    if (childIsRightOfParent && !center) {
      return childRect.x;
      // If the child is also a center element:
      // Just get the div starting point and cut it in half to get the x middle
    } else if (center) {
      return childRect.x + childRect.width / 2;
      // Else the div is on the left of the parent:
      // Just use the starting point of the div and add it's whole length to it
    } else {
      return childRect.x + childRect.width;
    }
  }

  // Calculates the first y point of the svg
  private calculateMoveToY(scrollHeight: number, parentRect: DOMRect, center: boolean): number {
    // If the div is in the center:
    // the y starting point can start at the bottom of the div
    // the scrollheight is used to add the scroll value so the div doesn't
    // start calculating from the top of the window but from the top of the page
    // Else if the div is leading to a child element that is not in also a center:
    // the starting point has to be just half the height to get the middle connection
    const addedHeight = center ? parentRect.height : parentRect.height / 2;
    return parentRect.y + addedHeight + scrollHeight;
  }

  // Calculates the second y point of the svg
  private calculateCurveY(childRect: DOMRect, center: boolean, scrollHeight: number): number {
    // If the div is in the center:
    // the ending y coordinate is just the childs y position combined with scroll height
    // to get the top of the div from the page start not window start
    // Else the child is not center:
    // so the y needs to be in the middle so child height is cut in half and added
    const addedHeight = center ? scrollHeight : childRect.height / 2 + scrollHeight;
    return childRect.y + addedHeight;
  }

  // Sets the x point of the curvature
  private calculateXCurvature(
    center: boolean,
    moveToX: number,
    childIsRightOfParent: boolean,
    curveX: number,
    firstX: boolean
  ): number {
    // If child is on the right
    // the curvepoint should be 0.33 or 0.66 times the difference of the
    // starting point and ending point of the svg line
    if (childIsRightOfParent && !center) {
      return moveToX + (curveX - moveToX) * (firstX ? 0.33 : 0.66);
      // Otherwise if its in the center
      // there shouldn't be curvature so we keep it at x
    } else if (center) {
      return moveToX;
      // And same as with the child on the right just inverted calculation
    } else {
      return moveToX - (moveToX - curveX) * (firstX ? 0.33 : 0.66);
    }
  }
}
