import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CardData, CardDataTree, CardPropertyCollection } from './map.model';
import { NodeId, Nodes, cardDataTree, nodes } from '../../assets/data';
import { v4 as uuidv4 } from 'uuid';
import { SettingsService } from './settings/settings.service';
import { Categories } from './settings/settings.model';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private cardPropertyCollection$$ = new BehaviorSubject<CardPropertyCollection>([]);
  public cardPropertyCollection$ = this.cardPropertyCollection$$.asObservable();
  private nodes$$ = new BehaviorSubject<Nodes>({});
  public nodes$ = this.nodes$$.asObservable();
  private cardDataTree$$ = new BehaviorSubject<CardDataTree>({});
  public cardDataTree$ = this.cardDataTree$$.asObservable();

  constructor(private settingsService: SettingsService) {
    this.nodes$$.next(nodes);
    this.cardDataTree$$.next(cardDataTree);
    this.handleCategoriesUpdates();
  }

  private handleCategoriesUpdates(): void {
    this.settingsService.categories$.subscribe((categories) => {
      this.patchCardDataOnCategoriesChange(categories);
    });
  }

  private patchCardDataOnCategoriesChange(categories: Categories): void {
    const tempTree = this.cardDataTree$$.value;
    Object.keys(tempTree).forEach((key) => {
      if (categories.findIndex((c) => c.categoryId === tempTree[key].categoryId) < 0) {
        tempTree[key].categoryId = '';
      }
    });
    this.cardDataTree$$.next(tempTree);
  }

  public setCardPropertyCollection(collection: CardPropertyCollection): void {
    this.cardPropertyCollection$$.next(collection);
  }

  public getNodes(): Nodes {
    return this.nodes$$.value;
  }

  public setNodes(nodes: Nodes): void {
    this.nodes$$.next(nodes);
  }

  public getCardDataTree(): CardDataTree {
    return this.cardDataTree$$.value;
  }

  public getCardDataForNode(node: NodeId): CardData {
    return this.cardDataTree$$.value[node];
  }

  public setCardDataTree(cardDataTree: CardDataTree): void {
    this.cardDataTree$$.next(cardDataTree);
  }

  public addCenterNodeAfterNodeId(nodeId: NodeId): void {
    const currentNodes = this.nodes$$.value;
    const newCenterId = uuidv4();
    const keys = Object.keys(currentNodes);
    const newNodes = {} as Nodes;
    for (let i = 0; i < keys.length; i++) {
      if (keys[i] === nodeId) {
        newNodes[keys[i]] = currentNodes[keys[i]];
        newNodes[newCenterId] = {
          children: [],
          mainKnot: true,
        };
      } else {
        newNodes[keys[i]] = currentNodes[keys[i]];
      }
    }
    this.nodes$$.next(newNodes);
  }
}
