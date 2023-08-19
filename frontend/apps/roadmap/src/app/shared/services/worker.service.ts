import { Injectable } from '@angular/core';
import { Observable, from, of, tap, fromEvent, switchMap, takeUntil, finalize, map, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WorkerService {
  private workers: { [key: string]: Worker } = {};

  constructor() {}

  private workerIsSupported(): boolean {
    return typeof Worker !== 'undefined';
  }

  public createWorker<T>(type: string, message: string | number): Observable<T | never> {
    if (type === 'auth-timer' && this.workerIsSupported()) {
      if (this.workers['auth-timer'] !== undefined) {
        this.removeWorker('auth-timer');
      }
      this.workers['auth-timer'] = new Worker(new URL('../workers/auth-timer.worker', import.meta.url));
      this.workers['auth-timer'].postMessage(message);
      return fromEvent<MessageEvent<T>>(this.workers['auth-timer'], 'message').pipe(
        switchMap((message) => of(message.data)),
        finalize(() => {
          this.workers['auth-timer'].terminate();
        })
      );
    }
    return throwError(() => new Error('Worker not supported!'));
  }

  public removeWorker(type: 'auth-timer') {
    this.workers[type]?.terminate();
    delete this.workers[type];
  }
}
