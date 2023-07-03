import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Categories } from './settings.model';
import { categories } from 'apps/roadmap/src/assets/data';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private categories$$ = new BehaviorSubject<Categories>([]);
  public categories$ = this.categories$$.asObservable();

  constructor() {
    this.categories$$.next(categories);
  }
}
