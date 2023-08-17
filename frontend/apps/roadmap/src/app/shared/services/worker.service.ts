import { Injectable } from '@angular/core';
import { Observable, from, of, tap, fromEvent, switchMap, takeUntil, finalize, map, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WorkerService {
  constructor() {}

  private workerIsSupported(): boolean {
    return typeof Worker !== 'undefined';
  }

  createWorker(type: string, stopper$: Observable<void>, message: string | number): Observable<unknown | never> {
    if (type === 'auth-timer' && this.workerIsSupported()) {
      const worker = new Worker(new URL('../workers/auth-timer.worker', import.meta.url));
      worker.postMessage(message);
      return fromEvent<MessageEvent>(worker, 'message').pipe(
        switchMap((message) => of(message.data)),
        takeUntil(stopper$),
        finalize(() => {
          worker.terminate();
        })
      );
    }
    return throwError(() => new Error('Worker not supported!'));
  }
}
