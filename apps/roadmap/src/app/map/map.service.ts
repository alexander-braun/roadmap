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
  private cardPropertyCollection$$ = new BehaviorSubject<Readonly<CardPropertyCollection>>([]);
  public cardPropertyCollection$ = this.cardPropertyCollection$$.asObservable();
  private nodes$$ = new BehaviorSubject<Readonly<Nodes>>({});
  public nodes$ = this.nodes$$.asObservable();
  private cardDataTree$$ = new BehaviorSubject<Readonly<CardDataTree>>({});
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

  public addNode(id: NodeId): void {
    const newNodeId = uuidv4();
    const tempTree = { ...this.nodes$$.value };
    tempTree[newNodeId] = {
      children: [],
      mainKnot: false,
    };
    tempTree[id].children.push(newNodeId);
    this.nodes$$.next(tempTree);
    const tempCardDataTree = { ...this.cardDataTree$$.value };
    tempCardDataTree[newNodeId] = {
      title: 'Edit',
    };
    this.cardDataTree$$.next(tempCardDataTree);
  }

  public deleteNode(id: NodeId): void {
    const tempNodesTree = { ...this.nodes$$.value };
    const tempCardDataTree = { ...this.cardDataTree$$.value };

    for (const child of tempNodesTree[id]?.children) {
      for (const subChild of tempNodesTree[child]?.children) {
        delete tempNodesTree[subChild];
        delete tempCardDataTree[subChild];
      }
      delete tempNodesTree[child];
      delete tempCardDataTree[child];
    }
    delete tempNodesTree[id];
    delete tempCardDataTree[id];

    for (const node of Object.keys(tempNodesTree)) {
      if (tempNodesTree[node].children.includes(id)) {
        const index = tempNodesTree[node].children.indexOf(id);
        tempNodesTree[node].children.splice(index, 1);
      }
    }

    this.nodes$$.next(tempNodesTree);
    this.cardDataTree$$.next(tempCardDataTree);
  }

  public getCardDataForNode(node: NodeId): CardData {
    return this.cardDataTree$$.value[node];
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
