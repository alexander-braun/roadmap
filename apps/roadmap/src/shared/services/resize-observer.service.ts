import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ResizeObserverService {
  constructor() {
    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        console.log('width: ', entry.contentRect.width);
        console.log('height: ', entry.contentRect.height);
      });
    });

    observer.observe(document.body);
  }
}
