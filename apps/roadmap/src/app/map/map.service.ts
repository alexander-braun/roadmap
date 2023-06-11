import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CardPropertyCollection } from './map.model';
import { Nodes, nodes } from '../../assets/data';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private cardPropertyCollection$$ = new BehaviorSubject<CardPropertyCollection>([]);
  public cardPropertyCollection$ = this.cardPropertyCollection$$.asObservable();
  private nodes$$ = new BehaviorSubject<Nodes>({});
  public nodes$ = this.nodes$$.asObservable();

  constructor() {
    this.nodes$$.next(nodes);
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
}
