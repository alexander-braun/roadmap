import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'my-overlay',
  template: '<div class="overlay">Inside overlay</div>',
  styles: [
    `
      .overlay {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        padding: 16px;
        background: green;
      }
    `,
  ],
})
export class OverlayComponent {}
