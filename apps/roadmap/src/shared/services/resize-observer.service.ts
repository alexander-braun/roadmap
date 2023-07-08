import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ResizeObserverService {
  private resize$$ = new Subject<void>();
  public resize$ = this.resize$$.asObservable();
  private innerWidth$$ = new BehaviorSubject<number>(0);
  public innerWidth$ = this.innerWidth$$.asObservable();

  constructor() {
    this.innerWidth$$.next(window.innerWidth);

    const observer = new ResizeObserver((entries) => {
      for (const _ of entries) {
        this.resize$$.next();
        this.innerWidth$$.next(window.innerWidth);
      }
    });
    observer.observe(document.querySelector('body')!);
  }

  public setResizeNext(): void {
    this.resize$$.next();
  }
}
