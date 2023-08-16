import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Categories, StatusChoices } from './settings.model';
import { categories, statusChoices } from '../../../assets/data';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private categories$$ = new BehaviorSubject<Categories>([]);
  public categories$ = this.categories$$.asObservable();
  private statusChoices$$ = new BehaviorSubject<StatusChoices>([]);
  public statusChoices$ = this.statusChoices$$.asObservable();

  constructor() {
    this.categories$$.next(categories);
    this.statusChoices$$.next(statusChoices);
  }

  public get categories(): Categories {
    return this.categories$$.value;
  }

  public cancelCategoriesForm(): void {
    this.categories$$.next(this.categories$$.value);
  }

  public get statusChoices(): StatusChoices {
    return this.statusChoices$$.value;
  }

  public saveCategoriesForm(formValue: Categories): void {
    this.categories$$.next(formValue);
  }
}
