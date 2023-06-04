import { Injectable } from '@angular/core';
import { Subject, debounceTime, fromEvent, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ResizeObserverService {
  public resize$ = new Subject<void>();
  constructor() {
    fromEvent(window, 'resize')
      .pipe(debounceTime(10))
      .subscribe(() => this.resize$.next());
  }
}
