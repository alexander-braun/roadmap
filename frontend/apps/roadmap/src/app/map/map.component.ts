import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChildren,
  ChangeDetectorRef,
} from '@angular/core';
import { NodeId } from '../../assets/data';
import { BehaviorSubject, tap, merge } from 'rxjs';
import { MapService } from './map.service';
import { CardPropertyCollection, Direction } from './map.model';
import { ResizeObserverService } from '../../shared/services/resize-observer.service';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'rdmp-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent implements AfterViewInit, OnInit {
  @ViewChildren('cardContainer') cardContainer?: QueryList<ElementRef<HTMLDivElement>>;
  public centerNodes$$ = new BehaviorSubject<NodeId[]>(this.generateCenterNodes());
  private htmlCardCollection$$ = new BehaviorSubject<HTMLCollection[]>([]);
  public readonly faPlus = faPlus;

  constructor(
    private mapService: MapService,
    private resizeObserver: ResizeObserverService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.mapService.getData();
    this.handleResize();
    this.htmlCardCollection$$.asObservable().subscribe(() => {
      this.setCardPropertyCollection();
    });
  }

  ngAfterViewInit(): void {
    this.getCards();
  }

  private getCards(): void {
    merge(this.mapService.nodes$, this.mapService.cardDataTree$).subscribe(() => {
      this.centerNodes$$.next(this.generateCenterNodes());
      this.htmlCardCollection$$.next(this.getAllCardElements());
    });
  }

  private handleResize(): void {
    this.resizeObserver.resize$
      .pipe(
        tap(() => {
          this.cdr.detectChanges();
          this.centerNodes$$.next(this.generateCenterNodes());
          this.htmlCardCollection$$.next(this.getAllCardElements());
        })
      )
      .subscribe();
  }

  appendCenterNode(section: any) {
    this.mapService.addCenterNodeAfterNodeId(section);
  }

  public generateChildrenOfNode(id: NodeId, direction: Direction, isSubchild = false): NodeId[] {
    const nodes = this.mapService.getNodes();
    const children = nodes[id].children;
    if (isSubchild) {
      return children;
    }
    const middle = Math.ceil(children.length / 2);
    const start = direction === 'left' ? 0 : middle;
    const end = direction === 'left' ? middle : children.length;
    return children.slice(start, end);
  }

  private setCardPropertyCollection(): void {
    const cardPropertyCollection = this.generateCardPropertyCollection();
    this.mapService.setCardPropertyCollection(cardPropertyCollection);
  }

  private generateCardPropertyCollection(): CardPropertyCollection {
    const pairs = this.getConnectedCardPairs() as NodeId[][];
    const htmlCollection = this.htmlCardCollection$$.value;
    const scrollHeight = window.scrollY;
    const width = window.innerWidth;
    const cardPropertyCollection: CardPropertyCollection = [];

    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i];
      const parent = this.getHtmlElementFromId(htmlCollection, pair[0] as NodeId);
      const child = this.getHtmlElementFromId(htmlCollection, pair[1] as NodeId);

      if (
        !parent ||
        !child ||
        (width < 1100 && parent.classList.contains('card--center') && !child.classList.contains('card--center'))
      ) {
        continue;
      }

      const parentRect = parent.getBoundingClientRect();
      const childRect = child.getBoundingClientRect();
      const center = parent.classList.contains('card--center') && child.classList.contains('card--center');

      cardPropertyCollection.push({
        parentRect,
        childRect,
        center,
        scrollHeight,
      });
    }
    return cardPropertyCollection;
  }

  private getConnectedCardPairs(): NodeId[][] {
    const nodes = this.mapService.getNodes();
    const nodeIds = Object.keys(nodes) as NodeId[];
    const pairs: NodeId[][] = [];
    const mainKnots: NodeId[] = [];

    for (const id of nodeIds) {
      const childIds = nodes[id].children;

      if (nodes[id].mainKnot) {
        mainKnots.push(id);
      }

      for (const childId of childIds) {
        pairs.push([id, childId]);
      }
    }

    for (let i = 0; i < mainKnots.length; i++) {
      if (mainKnots[i + 1]) {
        pairs.push([mainKnots[i], mainKnots[i + 1]]);
      }
    }

    return pairs;
  }

  private getAllCardElements(): HTMLCollection[] {
    let list: HTMLCollection[] = [];

    if (this.cardContainer) {
      list = this.cardContainer.toArray().map((element) => {
        return element.nativeElement.children;
      });
    }
    return list;
  }

  private generateCenterNodes(): NodeId[] {
    const nodes = this.mapService.getNodes();
    return Object.keys(nodes).reduce((acc, curr) => {
      return nodes[curr].mainKnot ? [...acc, curr] : acc;
    }, [] as string[]);
  }

  private getHtmlElementFromId(collections: HTMLCollection[], id: NodeId): Element | undefined {
    let element: Element | undefined;
    collections.forEach((collection) => {
      const tempEl = this.getElementFromCollection(collection, id);

      if (tempEl) {
        element = tempEl;
      }
    });
    return element;
  }

  private getElementFromCollection(collection: HTMLCollection, id: NodeId): Element | undefined {
    return Array.from(collection).find((el) => el.id === id);
  }
}
