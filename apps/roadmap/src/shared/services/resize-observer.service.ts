import { Injectable } from '@angular/core';
import { Subject, fromEvent } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ResizeObserverService {
  public resize$$ = new Subject<void>();
  public resize$ = this.resize$$.asObservable();
  constructor() {
    fromEvent(window, 'resize').subscribe(() => {
      this.resize$$.next();
    });
    fromEvent(document.body, 'resize').subscribe(() => {
      this.resize$$.next();
    });
  }
}
