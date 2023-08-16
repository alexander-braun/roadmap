import { Injectable, ApplicationRef } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ResizeObserverService {
  private resize$$ = new Subject<void>();
  public resize$ = this.resize$$.asObservable();
  private innerWidth$$ = new BehaviorSubject<number>(0);
  public innerWidth$ = this.innerWidth$$.asObservable();

  constructor(private appRef: ApplicationRef) {
    this.innerWidth$$.next(window.innerWidth);

    const observer = new ResizeObserver((entries) => {
      for (let i = 0; i < entries.length; i++) {
        this.resize$$.next();
        this.innerWidth$$.next(window.innerWidth);
      }
      this.appRef.tick();
    });
    observer.observe(document.body);
  }

  public setResizeNext(): void {
    this.resize$$.next();
  }
}
