import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChildren,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { BehaviorSubject, merge, takeUntil, Subject } from 'rxjs';
import { MapService } from './map.service';
import { CardCoordinateCollection, Direction } from './map.model';
import { faPlus, faWrench } from '@fortawesome/free-solid-svg-icons';
import { NodeId, Nodes } from 'apps/roadmap/src/assets/data';
import { ResizeObserverService } from '../../shared/services/resize-observer.service';

@Component({
  selector: 'rdmp-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChildren('cardContainer') cardContainer?: QueryList<ElementRef<HTMLDivElement>>;
  public centerNodes$$ = new BehaviorSubject<NodeId[]>([]);
  public readonly faPlus = faPlus;
  public readonly faGear = faWrench;
  public childrenLeft: NodeId[][] = [];
  public childrenRight: NodeId[][] = [];
  public subChildrenMapLeft: { [key: NodeId]: NodeId[] } = {};
  public subChildrenMapRight: { [key: NodeId]: NodeId[] } = {};
  private destroy$ = new Subject<void>();

  constructor(
    private mapService: MapService,
    private resizeObserver: ResizeObserverService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.handleResize();
  }

  ngAfterViewInit(): void {
    this.getCards();
  }

  ngOnDestroy(): void {
    this.cdr.detach();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getCards(): void {
    merge(this.mapService.nodes$, this.mapService.cardDataTree$)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateNodes();
      });
  }

  public trackById(_: number, item: NodeId): NodeId {
    return item;
  }

  private updateNodes(): void {
    this.cdr.detectChanges();
    this.centerNodes$$.next(this.generateCenterNodes());
    this.createChildNodeMaps();
    this.mapService.setCardCoordinateCollection(this.generateCardCoordinateCollection());
  }

  private handleResize(): void {
    this.resizeObserver.resize$.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.updateNodes();
      },
    });
  }

  private createChildNodeMaps(): void {
    this.childrenLeft = [];
    this.childrenRight = [];
    this.subChildrenMapLeft = {};
    this.subChildrenMapRight = {};

    this.centerNodes$$.value.forEach((centerNode, i) => {
      this.childrenLeft.push(this.generateChildrenOfNode(centerNode, 'left'));
      this.childrenLeft[i].forEach((child) => {
        this.subChildrenMapLeft[child] = this.generateChildrenOfNode(child, 'left', true);
      });
      this.childrenRight.push(this.generateChildrenOfNode(centerNode, 'right'));
      this.childrenRight[i].forEach((child) => {
        this.subChildrenMapRight[child] = this.generateChildrenOfNode(child, 'right', true);
      });
    });
  }

  public appendCenterNode(section: NodeId): void {
    this.mapService.addCenterNodeAfterNodeId(section);
  }

  public generateChildrenOfNode(id: NodeId, direction: Direction, isSubchild = false): NodeId[] {
    const nodes = this.mapService.getNodesValue();
    if (!nodes[id]?.children) {
      return [];
    }
    const children = [...nodes[id]?.children];
    children.forEach((child, i) => {
      if (nodes[child].mainKnot) {
        children.splice(i, 1);
      }
    });
    if (isSubchild) {
      return children;
    }
    const middle = Math.ceil(children.length / 2);
    const start = direction === 'left' ? 0 : middle;
    const end = direction === 'left' ? middle : children.length;
    return children.slice(start, end);
  }

  private generateCardCoordinateCollection(): CardCoordinateCollection {
    const pairs = this.getConnectedCardPairs() as NodeId[][];
    const htmlCollection = this.getAllCardElements();
    const scrollHeight = window.scrollY;
    const width = window.innerWidth;
    const cardCoordinateCollection: CardCoordinateCollection = [];

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

      cardCoordinateCollection.push({
        parentRect,
        childRect,
        center,
        scrollHeight,
      });
    }
    return cardCoordinateCollection;
  }

  private getConnectedCardPairs(): NodeId[][] {
    const nodes = this.mapService.getNodesValue();
    const pairs: NodeId[][] = [];
    Object.entries(nodes).forEach(([id, node], i) => {
      // This will now always be in order
      if (node.mainKnot) {
        node.children.forEach((childId) => {
          const childNode = nodes[childId];
          if (childNode?.mainKnot) {
            pairs.push([id, childId]);
          }
        });
      }

      // Now children
      node.children.forEach((childId) => {
        if (!nodes[childId]?.mainKnot) {
          pairs.push([id, childId]);
        }
      });
    });
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

  private getStartingKnot(nodes: Nodes): string | undefined {
    // First get all mainKnots
    const allMainKnots: string[] = [];
    Object.entries(nodes).forEach(([id, node]) => {
      if (node.mainKnot) {
        allMainKnots.push(id);
      }
    });
    // Now find all the children in childrens array of all main knots
    const nodeIdsInChildrenArray: string[] = [];
    allMainKnots.forEach((mainKnotId) => {
      if (nodes[mainKnotId].children?.length) {
        nodeIdsInChildrenArray.push(...nodes[mainKnotId].children);
      }
    });
    let startingKnot = undefined;
    // Now find the diff between the arrays
    allMainKnots.forEach((knot) => {
      if (nodeIdsInChildrenArray.indexOf(knot) < 0) {
        startingKnot = knot;
      }
    });
    return startingKnot;
  }

  private getMainKnotChildFromChildren(children: NodeId[], nodes: Nodes): string | undefined {
    let mainKnot: string | undefined = undefined;
    children.forEach((child) => {
      if (nodes[child].mainKnot) {
        mainKnot = child;
      }
    });
    return mainKnot;
  }

  private generateCenterNodes(): string[] {
    const nodes = this.mapService.getNodesValue();
    const startingKnot = this.getStartingKnot(nodes);
    if (!startingKnot) {
      return [];
    }
    let nextMainKnotChild = this.getMainKnotChildFromChildren(nodes[startingKnot]?.children || [], nodes);
    const mainKnotOrder: string[] = nextMainKnotChild ? [startingKnot, nextMainKnotChild] : [startingKnot];
    while (nextMainKnotChild) {
      const nextMainKnot = this.getMainKnotChildFromChildren(nodes[nextMainKnotChild].children || [], nodes);
      if (nextMainKnot) {
        mainKnotOrder.push(nextMainKnot);
      }
      nextMainKnotChild = nextMainKnot;
    }
    return mainKnotOrder;
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
