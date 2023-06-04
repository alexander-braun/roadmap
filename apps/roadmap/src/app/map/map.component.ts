import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { NodeId, nodes } from '../../assets/data';
import { tap } from 'rxjs';
import { MapService } from './map.service';
import { CardPropertyCollection, Direction } from './map.model';
import { ResizeObserverService } from '../../shared/services/resize-observer.service';

@Component({
  selector: 'rdmp-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent implements AfterViewInit, OnInit {
  @ViewChildren('cardContainer') cardContainer?: QueryList<ElementRef<HTMLDivElement>>;
  public nodes = nodes;
  public sections: NodeId[];

  constructor(private mapService: MapService, private resizeObserver: ResizeObserverService) {
    this.sections = this.generateSections();
  }

  ngOnInit(): void {
    this.resizeObserver.resize$
      .asObservable()
      .pipe(
        tap(() => {
          this.mapService.setCardPropertyCollection(this.generateCardProperties());
        })
      )
      .subscribe();
  }

  ngAfterViewInit(): void {
    this.mapService.setCardPropertyCollection(this.generateCardProperties());
  }

  public generateCardProperties(): CardPropertyCollection {
    const pairs = this.getConnectedCardPairs() as NodeId[][];
    const htmlCollection = this.getAllCardElements();
    const scrollHeight = window.scrollY;
    const width = window.innerWidth;
    const cardPropertyCollection: CardPropertyCollection = [];

    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i];
      const parent = this.getHtmlElementFromId(htmlCollection, pair[0] as NodeId);
      const child = this.getHtmlElementFromId(htmlCollection, pair[1] as NodeId);

      if (!parent || !child) {
        continue;
      }

      const parentRect = parent?.getBoundingClientRect();
      const childRect = child?.getBoundingClientRect();
      const isLastCenterElement = !(this.sections[this.sections.length - 1].indexOf(pair[0]) < 0);
      const center =
        (parent.classList.contains('card--center') && child.classList.contains('card--center')) || isLastCenterElement;

      if (
        width < 1100 &&
        parent.classList.contains('card--center') &&
        !child.classList.contains('card--center') &&
        this.sections[this.sections.length - 1].indexOf(pair[0]) < 0
      ) {
        continue;
      }

      cardPropertyCollection.push({
        parentRect,
        childRect,
        center,
        scrollHeight,
      });
    }
    return cardPropertyCollection;
  }

  public getConnectedCardPairs(): NodeId[][] {
    const nodeIds = Object.keys(this.nodes) as NodeId[];
    const pairs: NodeId[][] = [];
    const mainKnots: NodeId[] = [];

    for (const id of nodeIds) {
      const childIds = this.nodes[id].children;

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
      list = this.cardContainer.toArray().map((element) => element.nativeElement.children);
    }

    return list;
  }

  private generateSections(): NodeId[] {
    return Object.keys(this.nodes).reduce((acc, curr) => {
      return this.nodes[curr].mainKnot ? [...acc, curr] : acc;
    }, [] as string[]);
  }

  public generateChildrenOfNode(id: NodeId, direction: Direction, isSubchild = false): NodeId[] {
    const children = this.nodes[id].children;
    if (isSubchild) {
      return children;
    }
    const middle = Math.ceil(children.length / 2);
    const start = direction === 'left' ? 0 : middle;
    const end = direction === 'left' ? middle : children.length;
    return children.slice(start, end);
  }

  private getHtmlElementFromId(collections: HTMLCollection[], id: string) {
    let element: Element | undefined;
    collections.forEach((collection) => {
      const tempEl = this.getElementFromCollection(collection, id);

      if (tempEl) {
        element = tempEl;
      }
    });
    return element;
  }

  private getElementFromCollection(collection: HTMLCollection, id: string): Element | undefined {
    return Array.from(collection).find((el) => el.id === id);
  }
}
