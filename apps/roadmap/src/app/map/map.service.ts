import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CardData, CardDataTree, CardPropertyCollection } from './map.model';
import { NodeId, Nodes, cardDataTree, nodes } from '../../assets/data';

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

  constructor() {
    this.nodes$$.next(nodes);
    this.cardDataTree$$.next(cardDataTree);
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
}
