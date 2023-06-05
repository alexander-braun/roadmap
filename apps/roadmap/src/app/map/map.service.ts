import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CardPropertyCollection } from './map.model';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private cardPropertyCollection$$ = new BehaviorSubject<CardPropertyCollection>([]);
  public cardPropertyCollection$ = this.cardPropertyCollection$$.asObservable();

  constructor() {}

  public setCardPropertyCollection(collection: CardPropertyCollection): void {
    this.cardPropertyCollection$$.next(collection);
  }
}
